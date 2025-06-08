import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../services/minio.service';
import { Readable } from 'stream';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface TorrentDownloadJob {
  contentItemId: string;
  torrentUrl: string;
  infoHash?: string;
}

@Processor('torrent-download')
export class TorrentDownloadProcessor extends WorkerHost {
  private readonly logger = new Logger(TorrentDownloadProcessor.name);

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {
    super();
  }

  async process(job: Job<TorrentDownloadJob>): Promise<void> {
    const { contentItemId, torrentUrl } = job.data;

    this.logger.log(
      `Processing torrent download job: ${job.id} for content item: ${contentItemId}`,
    );

    try {
      // Update status to DOWNLOADING
      await this.prisma.contentItem.update({
        where: { id: contentItemId },
        data: { processingStatus: 'DOWNLOADING' },
      });

      // Implement actual torrent download logic
      this.logger.log(`Starting torrent download for: ${torrentUrl}`);

      const downloadedFiles = await this.downloadTorrent(torrentUrl);

      this.logger.log(
        `Downloaded ${downloadedFiles.length} files, uploading to MinIO...`,
      );

      // Upload files to MinIO
      await this.uploadFilesToMinio(downloadedFiles, contentItemId);

      this.logger.log(
        `Successfully uploaded ${downloadedFiles.length} files to MinIO`,
      );

      // Update status to DOWNLOAD_COMPLETED
      await this.prisma.contentItem.update({
        where: { id: contentItemId },
        data: { processingStatus: 'DOWNLOAD_COMPLETED' },
      });

      this.logger.log(`Successfully completed torrent download job: ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to process torrent download job ${job.id}: ${error.message}`,
      );

      // Update status to DOWNLOAD_FAILED
      await this.prisma.contentItem.update({
        where: { id: contentItemId },
        data: { processingStatus: 'DOWNLOAD_FAILED' },
      });

      throw error;
    }
  }

  private async downloadTorrent(torrentUrl: string): Promise<DownloadedFile[]> {
    const tempDir = `/tmp/torrent-${Date.now()}`;

    try {
      // Create temporary directory
      await fs.promises.mkdir(tempDir, { recursive: true });

      this.logger.log(`Downloading torrent to: ${tempDir}`);

      // Use aria2c to download the torrent
      const aria2Command = [
        'aria2c',
        '--bt-metadata-only=false',
        '--bt-save-metadata=false',
        '--seed-time=0',
        '--max-connection-per-server=16',
        '--max-concurrent-downloads=16',
        '--split=16',
        '--min-split-size=1M',
        '--continue=true',
        '--allow-overwrite=true',
        `--dir=${tempDir}`,
        `"${torrentUrl}"`,
      ].join(' ');

      this.logger.log(`Executing: ${aria2Command}`);

      // Execute aria2c with timeout
      const { stderr } = await execAsync(aria2Command, {
        timeout: 300000, // 5 minutes timeout
      });

      if (stderr && !stderr.includes('NOTICE')) {
        this.logger.warn(`aria2c stderr: ${stderr}`);
      }

      this.logger.log(`aria2c completed successfully`);

      // Read downloaded files
      const downloadedFiles = await this.readDownloadedFiles(tempDir);

      return downloadedFiles;
    } catch (error) {
      this.logger.error(`Failed to download torrent: ${error.message}`);
      throw error;
    } finally {
      // Clean up temporary directory
      try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
        this.logger.log(`Cleaned up temporary directory: ${tempDir}`);
      } catch (cleanupError) {
        this.logger.warn(
          `Failed to cleanup temp directory: ${cleanupError.message}`,
        );
      }
    }
  }

  private async readDownloadedFiles(
    directory: string,
  ): Promise<DownloadedFile[]> {
    const files: DownloadedFile[] = [];

    const readDirectory = async (
      dir: string,
      basePath: string = '',
    ): Promise<void> => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
          await readDirectory(fullPath, relativePath);
        } else if (entry.isFile()) {
          const stats = await fs.promises.stat(fullPath);
          const buffer = await fs.promises.readFile(fullPath);

          files.push({
            name: entry.name,
            buffer: buffer,
            size: stats.size,
            path: relativePath,
          });

          this.logger.log(`Read file: ${relativePath} (${stats.size} bytes)`);
        }
      }
    };

    await readDirectory(directory);
    return files;
  }

  private async uploadFilesToMinio(
    files: DownloadedFile[],
    contentItemId: string,
  ): Promise<void> {
    const uploadPromises = files.map(async (file, index) => {
      const objectName = `${contentItemId}/${file.name}`;
      const stream = Readable.from(file.buffer);

      const metaData = {
        'Content-Type': this.getContentType(file.name),
        'content-item-id': contentItemId,
        'file-index': index.toString(),
        'original-path': file.path,
      };

      return this.minioService.uploadStream(
        objectName,
        stream,
        file.size,
        metaData,
      );
    });

    await Promise.all(uploadPromises);
  }

  private getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      mp4: 'video/mp4',
      mkv: 'video/x-matroska',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      wmv: 'video/x-ms-wmv',
      flv: 'video/x-flv',
      webm: 'video/webm',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      flac: 'audio/flac',
      txt: 'text/plain',
      srt: 'text/plain',
      ass: 'text/plain',
      vtt: 'text/vtt',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}

interface DownloadedFile {
  name: string;
  buffer: Buffer;
  size: number;
  path: string;
}

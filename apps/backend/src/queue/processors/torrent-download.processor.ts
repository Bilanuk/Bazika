import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../services/minio.service';
import { VideoProcessingService } from '../services/video-processing.service';
import { Readable } from 'stream';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Popular open trackers to speed up downloads
const TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.stealth.si:80/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://tracker.moeking.me:6969/announce',
  'http://tracker.ipv6tracker.org:80/announce',
  'udp://9.rarbg.me:2710/announce',
  'udp://9.rarbg.to:2710/announce',
  'udp://tracker.tiny-vps.com:6969/announce',
  'udp://tracker.cyberia.is:6969/announce',
];

interface TorrentDownloadJob {
  contentItemId: string;
  torrentUrl: string;
  infoHash?: string;
  retryAttempt?: number;
}

@Processor('torrent-download', {
  concurrency: 5,
})
export class TorrentDownloadProcessor extends WorkerHost {
  private readonly logger = new Logger(TorrentDownloadProcessor.name);

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
    private videoProcessingService: VideoProcessingService,
    @InjectQueue('video-analysis') private videoAnalysisQueue: Queue,
    @InjectQueue('torrent-download') private downloadQueue: Queue,
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

      const { files: downloadedFiles } = await this.downloadTorrent(
        torrentUrl,
        job,
      );

      this.logger.log(
        `Downloaded ${downloadedFiles.length} files, uploading to MinIO...`,
      );

      // Upload files to MinIO
      await this.uploadFilesToMinio(downloadedFiles, contentItemId);

      this.logger.log(
        `Successfully uploaded ${downloadedFiles.length} files to MinIO`,
      );

      // Find the main video file
      const mainVideoFile = this.findMainVideoFile(downloadedFiles);

      // Update status to DOWNLOAD_COMPLETED and store video filename
      const updatedItem = await this.prisma.contentItem.update({
        where: { id: contentItemId },
        data: {
          processingStatus: 'DOWNLOAD_COMPLETED',
          downloadedFileName: mainVideoFile?.name?.trim() || null,
        },
        include: {
          episode: true,
        },
      });

      this.logger.log(`Successfully completed torrent download job: ${job.id}`);
      if (mainVideoFile) {
        this.logger.log(`Main video file: ${mainVideoFile.name}`);
      }

      // Automatically queue video processing if episode exists
      if (updatedItem.episode && mainVideoFile) {
        this.logger.log(
          `Auto-queueing video processing for episode ${updatedItem.episode.id}`,
        );
        await this.videoProcessingService.queueProcessing(
          contentItemId,
          updatedItem.episode.id,
          mainVideoFile.name,
        );

        // Queue Analysis
        this.logger.log(
          `Auto-queueing video analysis for episode ${updatedItem.episode.id}`,
        );
        await this.videoAnalysisQueue.add('analyze', {
          contentItemId,
          episodeId: updatedItem.episode.id,
          inputFileName: mainVideoFile.name,
        });
      } else {
        this.logger.warn(
          `Cannot auto-queue video processing: ${!updatedItem.episode ? 'no episode' : 'no video file'}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process torrent download job ${job.id}: ${error.message}`,
      );

      // Handle low seeders / timeouts differently
      const isTimeout =
        error.message && 
        (error.message.includes('Download timed out') || 
         error.message.includes('exited with code 28'));
      const maxSeeders = (error as any).maxSeeders;
      const aria2cCode = (error as any).aria2cCode;

      // Code 28 specifically means timeout/no seeders
      if ((isTimeout || aria2cCode === 28) && maxSeeders !== undefined && maxSeeders < 2) {
        // Low seeders detected
        this.logger.warn(
          `Download timed out with low seeders (max: ${maxSeeders}). Scheduling retry.`,
        );

        await this.prisma.contentItem.update({
          where: { id: contentItemId },
          data: { processingStatus: 'PENDING_SEEDERS' as any }, // Cast to any until schema types updated
        });

        // Schedule delayed retry
        await this.downloadQueue.add(
          'download-torrent',
          { ...job.data, retryAttempt: (job.data.retryAttempt || 0) + 1 },
          {
            delay: 3600000, // 1 hour delay
            attempts: 1,
            removeOnComplete: false,
            removeOnFail: false,
          },
        );
      } else {
        // Normal failure
        await this.prisma.contentItem.update({
          where: { id: contentItemId },
          data: { processingStatus: 'DOWNLOAD_FAILED' },
        });
      }

      throw error;
    }
  }

  private parseAria2Status(output: string) {
    // Example: [#2089b0 10MiB/100MiB(10%) CN:1 SD:2 DL:0B]
    const sdMatch = output.match(/SD:(\d+)/);
    const cnMatch = output.match(/CN:(\d+)/);
    const progressMatch = output.match(/\((\d+)%\)/);

    return {
      seeders: sdMatch ? parseInt(sdMatch[1], 10) : null,
      connections: cnMatch ? parseInt(cnMatch[1], 10) : null,
      progress: progressMatch ? parseInt(progressMatch[1], 10) : null,
    };
  }

  private async downloadTorrent(
    torrentUrl: string,
    job: Job<TorrentDownloadJob>,
  ): Promise<{ files: DownloadedFile[]; maxSeeders: number }> {
    const tempDir = `/tmp/torrent-${Date.now()}`;
    let maxSeedersDetected = 0;

    try {
      // Create temporary directory
      await fs.promises.mkdir(tempDir, { recursive: true });

      this.logger.log(`Downloading torrent to: ${tempDir}`);
      job.log(`Downloading torrent to: ${tempDir}`);

      // Use aria2c to download the torrent
      const aria2Args = [
        '--bt-metadata-only=false',
        '--bt-save-metadata=false',
        '--bt-remove-unselected-file=true',
        '--seed-time=0',
        '--max-connection-per-server=16',  // Max allowed by aria2c
        '--max-concurrent-downloads=16',
        '--bt-max-peers=100',
        '--enable-dht=true',
        '--dht-listen-port=6881-6999',
        '--listen-port=6881-6999',
        `--bt-tracker=${TRACKERS.join(',')}`,
        '--split=16',
        '--min-split-size=1M',
        '--continue=true',
        '--allow-overwrite=true',
        '--follow-torrent=mem',
        `--dir=${tempDir}`,
        torrentUrl,
      ];

      this.logger.log(`Executing: aria2c ${aria2Args.join(' ')}`);

      // Execute aria2c with timeout and progress tracking
      await new Promise<void>((resolve, reject) => {
        const child = spawn('aria2c', aria2Args);

        // Set 30 minutes timeout
        const timeout = setTimeout(() => {
          child.kill();
          const err: any = new Error('Download timed out (30 minutes limit)');
          err.maxSeeders = maxSeedersDetected;
          reject(err);
        }, 1800000);

        let lastLogTime = 0;
        let stderrOutput = ''; // Capture stderr for error diagnostics

        child.stdout.on('data', (data) => {
          const output = data.toString();
          const status = this.parseAria2Status(output);

          if (status.progress !== null) {
            job.updateProgress(status.progress);
          }

          if (status.seeders !== null) {
            if (status.seeders > maxSeedersDetected) {
              maxSeedersDetected = status.seeders;
            }
          }

          if (Date.now() - lastLogTime > 30000 && status.progress !== null) {
            const logMsg = `Download Progress: ${status.progress}%, Seeders: ${status.seeders || 0}, Connections: ${status.connections || 0}`;
            this.logger.log(logMsg);
            job.log(logMsg);
            lastLogTime = Date.now();
          }
        });

        child.stderr.on('data', (data) => {
          const output = data.toString();
          stderrOutput += output;
          this.logger.warn(`aria2c stderr: ${output}`);
          job.log(`aria2c stderr: ${output}`);
        });

        child.on('close', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            job.updateProgress(100);
            resolve();
          } else {
            // Enhanced error message with aria2c error details
            let errorMsg = `aria2c exited with code ${code}`;
            
            // Add human-readable error explanation
            if (code === 28) {
              errorMsg += ' (Timeout - Failed to download within time limit or no seeders available)';
            } else if (code === 1) {
              errorMsg += ' (Unknown error)';
            } else if (code === 2) {
              errorMsg += ' (Timeout)';
            } else if (code === 3) {
              errorMsg += ' (Resource not found)';
            } else if (code === 24) {
              errorMsg += ' (Could not parse torrent file)';
            }
            
            // Append stderr if available
            if (stderrOutput.trim()) {
              errorMsg += `\naria2c output: ${stderrOutput.trim()}`;
            }
            
            const err: any = new Error(errorMsg);
            err.maxSeeders = maxSeedersDetected;
            err.aria2cCode = code;
            reject(err);
          }
        });

        child.on('error', (err: any) => {
          clearTimeout(timeout);
          err.maxSeeders = maxSeedersDetected;
          reject(err);
        });
      });

      this.logger.log(
        `aria2c completed successfully. Max seeders: ${maxSeedersDetected}`,
      );
      job.log(
        `aria2c completed successfully. Max seeders: ${maxSeedersDetected}`,
      );

      // Read downloaded files
      const downloadedFiles = await this.readDownloadedFiles(tempDir);

      return { files: downloadedFiles, maxSeeders: maxSeedersDetected };
    } catch (error) {
      this.logger.error(`Failed to download torrent: ${error.message}`);
      job.log(`Failed to download torrent: ${error.message}`);
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
          // Skip .torrent metadata files
          if (entry.name.endsWith('.torrent')) {
            this.logger.log(`Skipping torrent metadata file: ${relativePath}`);
            continue;
          }

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

  private findMainVideoFile(
    files: DownloadedFile[],
  ): DownloadedFile | undefined {
    const videoExtensions = [
      '.mp4',
      '.mkv',
      '.avi',
      '.mov',
      '.wmv',
      '.flv',
      '.webm',
    ];

    return files.find((file) =>
      videoExtensions.some((ext) => file.name.toLowerCase().endsWith(ext)),
    );
  }
}

interface DownloadedFile {
  name: string;
  buffer: Buffer;
  size: number;
  path: string;
}

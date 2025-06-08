import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../services/minio.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface VideoProcessingJob {
  contentItemId: string;
  episodeId: string;
  inputFileName: string;
}

@Processor('video-processing')
export class VideoProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoProcessingProcessor.name);

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {
    super();
  }

  async process(job: Job<VideoProcessingJob>): Promise<void> {
    const { contentItemId, episodeId, inputFileName } = job.data;
    let tempDir: string | null = null;

    this.logger.log(
      `Processing video job: ${job.id} for episode: ${episodeId}`,
    );
    this.logger.log(
      `Looking for file: ${contentItemId}/${inputFileName} in torrents bucket`,
    );

    try {
      // Update status to PROCESSING
      await this.prisma.contentItem.update({
        where: { id: contentItemId },
        data: { processingStatus: 'PROCESSING' },
      });

      // Download video from torrent bucket
      tempDir = `/tmp/video-processing-${Date.now()}`;
      await fs.promises.mkdir(tempDir, { recursive: true });

      const inputPath = path.join(tempDir, 'input.mkv');
      const outputDir = path.join(tempDir, 'output');
      await fs.promises.mkdir(outputDir, { recursive: true });

      this.logger.log(
        `Downloading video from MinIO torrents bucket: ${contentItemId}/${inputFileName}`,
      );

      // Download video file from torrent bucket
      let videoStream;
      try {
        videoStream = await this.minioService.getObject(
          `${contentItemId}/${inputFileName}`,
          'torrents', // Explicitly specify torrents bucket
        );
      } catch (s3Error) {
        this.logger.error(
          `S3/MinIO error downloading ${contentItemId}/${inputFileName} from torrents bucket: ${s3Error.message}`,
        );

        // Try to list available files in the content item directory for debugging
        try {
          const availableFiles = await this.minioService.listObjects(
            contentItemId,
            'torrents', // Explicitly specify torrents bucket
          );
          this.logger.error(
            `Available files in ${contentItemId} (torrents bucket): ${availableFiles.join(', ')}`,
          );
        } catch (listError) {
          this.logger.error(
            `Could not list files in ${contentItemId} (torrents bucket): ${listError.message}`,
          );
        }

        throw new Error(
          `Video file not found in torrents bucket: ${contentItemId}/${inputFileName}. Original error: ${s3Error.message}`,
        );
      }

      const writeStream = fs.createWriteStream(inputPath);
      videoStream.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      this.logger.log('Video downloaded, starting FFmpeg processing...');

      // Process video with FFmpeg to HLS
      await this.processVideoToHLS(inputPath, outputDir);

      this.logger.log(
        'FFmpeg processing completed, uploading to anime bucket...',
      );

      // Upload HLS files to anime bucket
      const m3u8Url = await this.uploadHLSFiles(outputDir, episodeId);

      // Update episode with HLS URL
      await this.prisma.episode.update({
        where: { id: episodeId },
        data: { url: m3u8Url },
      });

      // Update status to PROCESSING_COMPLETED
      await this.prisma.contentItem.update({
        where: { id: contentItemId },
        data: { processingStatus: 'PROCESSING_COMPLETED' },
      });

      this.logger.log(`Successfully completed video processing job: ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to process video job ${job.id}: ${error.message}`,
      );

      // Update status to PROCESSING_FAILED
      await this.prisma.contentItem.update({
        where: { id: contentItemId },
        data: { processingStatus: 'PROCESSING_FAILED' },
      });

      throw error;
    } finally {
      // Clean up temporary files
      if (tempDir) {
        try {
          await fs.promises.rm(tempDir, { recursive: true, force: true });
          this.logger.log(`Cleaned up temporary directory: ${tempDir}`);
        } catch (cleanupError) {
          this.logger.warn(
            `Failed to cleanup temp files: ${cleanupError.message}`,
          );
        }
      }
    }
  }

  private async processVideoToHLS(
    inputPath: string,
    outputDir: string,
  ): Promise<void> {
    const outputPlaylist = path.join(outputDir, 'playlist.m3u8');

    const ffmpegCommand = [
      'ffmpeg',
      '-i',
      `"${inputPath}"`,
      '-c:v',
      'libx264',
      '-c:a',
      'aac',
      '-hls_time',
      '10',
      '-hls_list_size',
      '0',
      '-hls_segment_filename',
      `"${path.join(outputDir, 'segment_%03d.ts')}"`,
      '-f',
      'hls',
      `"${outputPlaylist}"`,
    ].join(' ');

    this.logger.log(`Executing FFmpeg: ${ffmpegCommand}`);

    const { stderr } = await execAsync(ffmpegCommand, {
      timeout: 1800000, // 30 minutes timeout
    });

    if (stderr && !stderr.includes('frame=')) {
      this.logger.warn(`FFmpeg stderr: ${stderr}`);
    }

    this.logger.log('FFmpeg processing completed successfully');
  }

  private async uploadHLSFiles(
    outputDir: string,
    episodeId: string,
  ): Promise<string> {
    const files = await fs.promises.readdir(outputDir);
    const uploadPromises: Promise<string>[] = [];

    for (const file of files) {
      const filePath = path.join(outputDir, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.isFile()) {
        const objectName = `${episodeId}/${file}`;
        const fileStream = fs.createReadStream(filePath);

        const contentType = file.endsWith('.m3u8')
          ? 'application/vnd.apple.mpegurl'
          : file.endsWith('.ts')
            ? 'video/mp2t'
            : 'application/octet-stream';

        const uploadPromise = this.minioService.uploadStream(
          objectName,
          fileStream,
          stats.size,
          { 'Content-Type': contentType },
          'anime', // Use anime bucket
        );

        uploadPromises.push(uploadPromise);
        this.logger.log(`Uploading: ${objectName}`);
      }
    }

    await Promise.all(uploadPromises);

    // Return the URL to the main playlist
    return `${episodeId}/playlist.m3u8`;
  }
}

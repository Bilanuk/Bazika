import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
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

@Processor('video-processing', {
  concurrency: 1,
})
export class VideoProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoProcessingProcessor.name);

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
    @InjectQueue('video-analysis') private analysisQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<VideoProcessingJob>): Promise<void> {
    const { contentItemId, episodeId, inputFileName } = job.data;
    let tempDir: string | null = null;

    await job.log(`Processing video job: ${job.id} for episode: ${episodeId}`);
    await job.log(
      `Looking for file: ${contentItemId}/${inputFileName} in torrents bucket`,
    );

    try {
      // Update status to PROCESSING
      await job.updateProgress(0);
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

      await job.log(
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

      await job.log('Video downloaded, starting FFmpeg processing...');
      await job.updateProgress(20);

      // Process video with FFmpeg to HLS
      await this.processVideoToHLS(inputPath, outputDir, job);

      await job.log(
        'FFmpeg processing completed, uploading to anime bucket...',
      );
      await job.updateProgress(70);

      // Upload HLS files to anime bucket
      const m3u8Url = await this.uploadHLSFiles(outputDir, episodeId, job);
      await job.updateProgress(85);

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
      await job.updateProgress(95);

      // Trigger analysis
      await this.analysisQueue.add('analyze', {
        contentItemId,
        episodeId,
        inputFileName,
      });
      await job.log(`Triggered analysis job for episode: ${episodeId}`);

      await job.updateProgress(100);
      await job.log(`Successfully completed video processing job: ${job.id}`);
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
          await job.log(`Cleaned up temporary directory: ${tempDir}`);
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
    job: Job,
  ): Promise<void> {
    const outputPlaylist = path.join(outputDir, 'playlist.m3u8');

    const ffmpegCommand = [
      'ffmpeg',
      '-hwaccel',
      'videotoolbox',
      '-i',
      `"${inputPath}"`,
      '-c:v',
      'h264_videotoolbox',
      '-b:v',
      '3M',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
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

    await job.log(`Executing FFmpeg with VideoToolbox: ${ffmpegCommand}`);
    await job.updateProgress(30);

    const { stderr } = await execAsync(ffmpegCommand, {
      timeout: 1800000, // 30 minutes timeout
    });

    if (stderr && !stderr.includes('frame=')) {
      await job.log(`FFmpeg stderr: ${stderr}`);
    }

    await job.log('FFmpeg processing completed successfully');
    await job.updateProgress(60);
  }

  private async uploadHLSFiles(
    outputDir: string,
    episodeId: string,
    job: Job,
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
        await job.log(`Uploading: ${objectName}`);
      }
    }

    await Promise.all(uploadPromises);
    await job.log(`Uploaded ${files.length} HLS files to anime bucket`);

    // Return the URL to the main playlist
    return `${episodeId}/playlist.m3u8`;
  }
}

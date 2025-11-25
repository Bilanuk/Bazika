import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../queue/services/minio.service';
import { AnalysisService } from './analysis.service';
import * as fs from 'fs';
import * as path from 'path';

interface AnalysisJob {
  contentItemId: string;
  episodeId: string;
  inputFileName: string;
}

@Processor('video-analysis', {
  concurrency: 1, // Process only 1 video analysis at a time
})
export class AnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
    private analysisService: AnalysisService,
  ) {
    super();
  }

  async process(job: Job<AnalysisJob>): Promise<void> {
    const { contentItemId, episodeId, inputFileName } = job.data;
    let tempDir: string | null = null;

    this.logger.log(`Starting analysis job ${job.id} for episode ${episodeId}`);

    try {
      // 1. Create DB entry if not exists (or update status)
      await this.prisma.videoAnalysis.upsert({
        where: { episodeId },
        create: {
          episodeId,
          status: 'PROCESSING',
          rawResults: {},
          visualEmbedding: [],
          tags: [],
        },
        update: {
          status: 'PROCESSING',
        },
      });

      // 2. Download file
      tempDir = `/tmp/video-analysis-${Date.now()}`;
      await fs.promises.mkdir(tempDir, { recursive: true });
      const inputPath = path.join(tempDir, 'input.mkv');

      this.logger.log(
        `Downloading ${contentItemId}/${inputFileName} for analysis`,
      );

      const videoStream = await this.minioService.getObject(
        `${contentItemId}/${inputFileName}`,
        'torrents',
      );

      const writeStream = fs.createWriteStream(inputPath);
      videoStream.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      // 3. Run Analysis
      this.logger.log('Running ML analysis...');
      const result = await this.analysisService.analyzeVideo(inputPath);
      this.logger.log('Analysis completed successfully');

      // 4. Save Results
      await this.prisma.videoAnalysis.update({
        where: { episodeId },
        data: {
          status: 'COMPLETED',
          visualEmbedding: result.visual_embedding,
          tags: result.tags,
          rating: result.rating,
          rawResults: result as any, // Cast to any for Json type
        },
      });
    } catch (error) {
      this.logger.error(`Analysis failed for job ${job.id}: ${error.message}`);

      await this.prisma.videoAnalysis.upsert({
        where: { episodeId },
        create: {
          episodeId,
          status: 'FAILED',
          rawResults: { error: error.message },
          visualEmbedding: [],
          tags: [],
        },
        update: {
          status: 'FAILED',
          rawResults: { error: error.message },
        },
      });

      throw error;
    } finally {
      // Cleanup
      if (tempDir) {
        try {
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch (e) {
          this.logger.warn(`Failed to cleanup temp dir: ${e.message}`);
        }
      }
    }
  }
}

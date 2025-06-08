import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface VideoProcessingJob {
  contentItemId: string;
  episodeId: string;
  inputFileName: string;
}

@Injectable()
export class VideoProcessingService {
  private readonly logger = new Logger(VideoProcessingService.name);

  constructor(
    @InjectQueue('video-processing') private processingQueue: Queue,
  ) {}

  async queueProcessing(
    contentItemId: string,
    episodeId: string,
    inputFileName: string,
  ): Promise<void> {
    await this.processingQueue.add(
      'process-video',
      {
        contentItemId,
        episodeId,
        inputFileName,
      } as VideoProcessingJob,
      {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    );

    this.logger.log(
      `Queued video processing for content item: ${contentItemId}, episode: ${episodeId}`,
    );
  }

  async getQueueStatus() {
    const waiting = await this.processingQueue.getWaiting();
    const active = await this.processingQueue.getActive();
    const completed = await this.processingQueue.getCompleted();
    const failed = await this.processingQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }
} 
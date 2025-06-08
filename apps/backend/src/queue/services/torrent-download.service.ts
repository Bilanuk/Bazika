import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface TorrentDownloadJob {
  contentItemId: string;
  torrentUrl: string;
  infoHash?: string;
}

@Injectable()
export class TorrentDownloadService {
  private readonly logger = new Logger(TorrentDownloadService.name);

  constructor(@InjectQueue('torrent-download') private downloadQueue: Queue) {}

  async queueDownload(
    contentItemId: string,
    torrentUrl: string,
    infoHash?: string,
  ): Promise<void> {
    await this.downloadQueue.add(
      'download-torrent',
      {
        contentItemId,
        torrentUrl,
        infoHash,
      } as TorrentDownloadJob,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    this.logger.log(
      `Queued torrent download for content item: ${contentItemId}`,
    );
  }

  async getQueueStatus() {
    const waiting = await this.downloadQueue.getWaiting();
    const active = await this.downloadQueue.getActive();
    const completed = await this.downloadQueue.getCompleted();
    const failed = await this.downloadQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }
}

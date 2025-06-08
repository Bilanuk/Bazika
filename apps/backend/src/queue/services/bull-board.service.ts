import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

@Injectable()
export class BullBoardService {
  private readonly logger = new Logger(BullBoardService.name);
  private serverAdapter: ExpressAdapter;

  constructor(
    @InjectQueue('torrent-download') private torrentDownloadQueue: Queue,
    @InjectQueue('video-processing') private videoProcessingQueue: Queue,
  ) {
    this.setupBullBoard();
  }

  private setupBullBoard(): void {
    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [
        new BullMQAdapter(this.torrentDownloadQueue),
        new BullMQAdapter(this.videoProcessingQueue),
      ],
      serverAdapter: this.serverAdapter,
    });

    this.logger.log('Bull Board dashboard initialized at /admin/queues');
  }

  getRouter() {
    return this.serverAdapter.getRouter();
  }
} 
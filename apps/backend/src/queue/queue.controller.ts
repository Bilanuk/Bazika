import { Controller, Get } from '@nestjs/common';
import { TorrentDownloadService } from './services/torrent-download.service';

@Controller('api/queue')
export class QueueController {
  constructor(private torrentDownloadService: TorrentDownloadService) {}

  @Get('status')
  async getQueueStatus() {
    return await this.torrentDownloadService.getQueueStatus();
  }
}

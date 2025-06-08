import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TorrentDownloadService } from '@/queue/services/torrent-download.service';

@Injectable()
export class ContentItemsService {
  private readonly logger = new Logger(ContentItemsService.name);

  constructor(
    private prisma: PrismaService,
    private torrentDownloadService: TorrentDownloadService,
  ) {}

  async queueTorrentDownload(contentItemId: string): Promise<void> {
    // Find the content item
    const contentItem = await this.prisma.contentItem.findUnique({
      where: { id: contentItemId },
    });

    if (!contentItem) {
      throw new Error('Content item not found');
    }

    // Check if the content item has a torrent URL
    if (!contentItem.url) {
      throw new Error('Content item has no torrent URL');
    }

    // Validate that the URL looks like a torrent (magnet link or .torrent file)
    const isMagnetLink = contentItem.url.startsWith('magnet:');
    const isTorrentFile = contentItem.url.endsWith('.torrent');

    if (!isMagnetLink && !isTorrentFile) {
      throw new Error('Content item URL is not a valid torrent URL');
    }

    // Queue the download
    await this.torrentDownloadService.queueDownload(
      contentItemId,
      contentItem.url,
      contentItem.infoHash,
    );

    this.logger.log(
      `Queued torrent download for content item: ${contentItemId}`,
    );
  }
}

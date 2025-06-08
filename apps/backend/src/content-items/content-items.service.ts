import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TorrentDownloadService } from '@/queue/services/torrent-download.service';
import { VideoProcessingService } from '@/queue/services/video-processing.service';
import { MinioService } from '@/queue/services/minio.service';

@Injectable()
export class ContentItemsService {
  private readonly logger = new Logger(ContentItemsService.name);

  constructor(
    private prisma: PrismaService,
    private torrentDownloadService: TorrentDownloadService,
    private videoProcessingService: VideoProcessingService,
    private minioService: MinioService,
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

  async queueVideoProcessing(contentItemId: string): Promise<void> {
    // Find the content item with episode information
    const contentItem = await this.prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: {
        episode: true,
      },
    });

    if (!contentItem) {
      throw new Error('Content item not found');
    }

    if (!contentItem.episode) {
      throw new Error('Content item is not associated with an episode');
    }

    if (
      contentItem.processingStatus !== 'DOWNLOAD_COMPLETED' &&
      contentItem.processingStatus !== 'PROCESSING_FAILED'
    ) {
      throw new Error('Content item must be downloaded before processing');
    }

    // For reprocessing failed items, use the stored filename if available
    let videoFileName = contentItem.downloadedFileName?.trim();

    // If no stored filename, try to find the video file in MinIO
    if (!videoFileName) {
      videoFileName = await this.findVideoFile(contentItemId);
    }

    if (!videoFileName) {
      throw new Error('No video file found for this content item');
    }

    // Queue the video processing
    await this.videoProcessingService.queueProcessing(
      contentItemId,
      contentItem.episode.id,
      videoFileName,
    );

    this.logger.log(
      `Queued video processing for content item: ${contentItemId}, episode: ${contentItem.episode.id}`,
    );
  }

  private async findVideoFile(contentItemId: string): Promise<string | null> {
    try {
      // List objects in the content item folder in torrents bucket
      const objects = await this.minioService.listObjects(
        contentItemId,
        'torrents',
      );

      // Find video files (common video extensions)
      const videoExtensions = [
        '.mkv',
        '.mp4',
        '.avi',
        '.mov',
        '.wmv',
        '.flv',
        '.webm',
      ];

      for (const objectName of objects) {
        const fileName = objectName.split('/').pop() || '';
        const hasVideoExtension = videoExtensions.some((ext) =>
          fileName.toLowerCase().endsWith(ext),
        );

        if (hasVideoExtension) {
          return fileName;
        }
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to find video file for ${contentItemId}: ${error.message}`,
      );
      return null;
    }
  }
}

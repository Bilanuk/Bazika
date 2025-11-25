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

  async getContentItem(contentItemId: string) {
    return this.prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: {
        episode: true,
        source: true,
      },
    });
  }

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

  async reprocessContentItem(
    contentItemId: string,
    episodeId: string,
    skipDownload = false,
  ): Promise<void> {
    // Find the content item
    const contentItem = await this.prisma.contentItem.findUnique({
      where: { id: contentItemId },
    });

    if (!contentItem) {
      throw new Error('Content item not found');
    }

    // Delete existing processed files from anime bucket
    try {
      this.logger.log(
        `Deleting existing processed files for episode: ${episodeId}`,
      );
      await this.minioService.deleteFolder(episodeId, 'anime');
    } catch (error) {
      this.logger.warn(
        `Failed to delete existing files (may not exist): ${error.message}`,
      );
    }

    // Delete existing video analysis
    try {
      await this.prisma.videoAnalysis.deleteMany({
        where: { episodeId },
      });
      this.logger.log(`Deleted video analysis for episode: ${episodeId}`);
    } catch (error) {
      this.logger.warn(`Failed to delete video analysis: ${error.message}`);
    }

    // If skipDownload is true and we have a downloaded file, go straight to video processing
    if (skipDownload && contentItem.downloadedFileName) {
      this.logger.log(
        `Skipping download, using existing file: ${contentItem.downloadedFileName}`,
      );

      // Update status to DOWNLOAD_COMPLETED
      await this.prisma.contentItem.update({
        where: { id: contentItemId },
        data: {
          processingStatus: 'DOWNLOAD_COMPLETED',
        },
      });

      // Queue video processing directly
      await this.videoProcessingService.queueProcessing(
        contentItemId,
        episodeId,
        contentItem.downloadedFileName,
      );

      this.logger.log(
        `Queued video processing for reprocess: ${contentItemId}`,
      );
    } else {
      // Reset status and start from download
      await this.prisma.contentItem.update({
        where: { id: contentItemId },
        data: {
          processingStatus: 'NONE',
          downloadedFileName: null,
        },
      });

      // Delete torrent files if re-downloading
      try {
        this.logger.log(
          `Deleting existing torrent files for content item: ${contentItemId}`,
        );
        await this.minioService.deleteFolder(contentItemId, 'torrents');
      } catch (error) {
        this.logger.warn(`Failed to delete torrent files: ${error.message}`);
      }

      // Queue torrent download
      await this.queueTorrentDownload(contentItemId);

      this.logger.log(
        `Queued torrent download for reprocess: ${contentItemId}`,
      );
    }
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

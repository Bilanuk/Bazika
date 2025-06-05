import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SourcesService } from '../sources/sources.service';
import { ContentItemsService } from './content-items.service';
import { RssMonitoringService } from './rss-monitoring.service';
import { NotificationService } from './notification.service';
import { SourceType } from '@database';

@Injectable()
export class ContentMonitoringService {
  private readonly logger = new Logger(ContentMonitoringService.name);

  constructor(
    private sourcesService: SourcesService,
    private contentItemsService: ContentItemsService,
    private rssMonitoringService: RssMonitoringService,
    private notificationService: NotificationService,
  ) {}

  // Run every 15 minutes
  @Cron(CronExpression.EVERY_10_MINUTES)
  async monitorAllSources(): Promise<void> {
    this.logger.log('Starting scheduled content monitoring...');

    try {
      const sources = await this.sourcesService.getAllActiveSources();
      this.logger.log(`Found ${sources.length} active sources to monitor`);

      const newContentItems = [];

      for (const source of sources) {
        try {
          this.logger.log(`Monitoring source: ${source.name} (${source.type})`);

          if (source.type === SourceType.RSS) {
            const contentItems =
              await this.rssMonitoringService.fetchRSSFeed(source);

            for (const contentData of contentItems) {
              // Filter for anime content if it's a Nyaa source
              if (source.name.toLowerCase().includes('nyaa')) {
                if (
                  !this.rssMonitoringService.isNyaaAnimeItem(contentData.title)
                ) {
                  continue;
                }
              }

              const newItem = await this.contentItemsService.createContentItem(
                source.id,
                contentData,
              );

              if (newItem) {
                newContentItems.push(newItem);
              }
            }

            // Update last checked timestamp
            await this.sourcesService.updateSourceLastChecked(source.id);
          }
        } catch (error) {
          this.logger.error(
            `Failed to monitor source ${source.name}: ${error.message}`,
            error.stack,
          );
        }
      }

      // Send notifications for new content
      if (newContentItems.length > 0) {
        this.logger.log(`Found ${newContentItems.length} new content items`);

        if (newContentItems.length === 1) {
          await this.notificationService.notifyNewContent(newContentItems[0]);
        } else {
          await this.notificationService.notifyBulkContent(newContentItems);
        }

        // Mark items as notified
        for (const item of newContentItems) {
          await this.contentItemsService.markAsNotified(item.id);
        }
      } else {
        this.logger.log('No new content found');
      }
    } catch (error) {
      this.logger.error(
        `Content monitoring failed: ${error.message}`,
        error.stack,
      );
    }
  }

  async manualMonitor(): Promise<{ newItems: number; sources: number }> {
    this.logger.log('Starting manual content monitoring...');

    const sources = await this.sourcesService.getAllActiveSources();
    let totalNewItems = 0;

    for (const source of sources) {
      if (source.type === SourceType.RSS) {
        const contentItems =
          await this.rssMonitoringService.fetchRSSFeed(source);

        for (const contentData of contentItems) {
          const newItem = await this.contentItemsService.createContentItem(
            source.id,
            contentData,
          );

          if (newItem) {
            totalNewItems++;
            await this.notificationService.notifyNewContent(newItem);
            await this.contentItemsService.markAsNotified(newItem.id);
          }
        }

        await this.sourcesService.updateSourceLastChecked(source.id);
      }
    }

    return { newItems: totalNewItems, sources: sources.length };
  }

  async addNyaaSource(name: string, rssUrl: string): Promise<void> {
    this.logger.log(`Adding new Nyaa RSS source: ${name}`);

    await this.sourcesService.createSource(name, SourceType.RSS, rssUrl);
    this.logger.log(`Successfully added Nyaa source: ${name}`);
  }

  async getMonitoringStatus(): Promise<{
    activeSources: number;
    unnotifiedItems: number;
    recentItems: any[];
  }> {
    const sources = await this.sourcesService.getAllActiveSources();
    const unnotifiedItems = await this.contentItemsService.getUnnotifiedItems();
    const recentItems = await this.contentItemsService.getRecentItems(5);

    return {
      activeSources: sources.length,
      unnotifiedItems: unnotifiedItems.length,
      recentItems: recentItems.map((item) => ({
        id: item.id,
        title: item.title,
        sourceId: item.sourceId,
        publishedAt: item.publishedAt,
        notificationSent: item.notificationSent,
        processingStatus: item.processingStatus,
      })),
    };
  }
}

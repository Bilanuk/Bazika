import { Injectable, Logger } from '@nestjs/common';
import { ContentItemsRepository } from './content-items.repository';
import { ContentItem } from '@database';
import { IContentItem } from '../common/interfaces/content-item.interface';

@Injectable()
export class ContentItemsService {
  private readonly logger = new Logger(ContentItemsService.name);

  constructor(private contentItemsRepository: ContentItemsRepository) {}

  async createContentItem(
    sourceId: string,
    contentData: IContentItem,
  ): Promise<ContentItem | null> {
    try {
      // Check if item already exists
      const existingItem = await this.contentItemsRepository.findByGuid(
        contentData.guid,
      );

      if (existingItem) {
        return null;
      }

      // Create new content item
      const newItem = await this.contentItemsRepository.create({
        title: contentData.title,
        description: contentData.description,
        url: contentData.url,
        guid: contentData.guid,
        publishedAt: contentData.publishedAt,
        source: { connect: { id: sourceId } },
      });

      this.logger.log(`Created new content item: ${newItem.title}`);
      return newItem;
    } catch (error) {
      this.logger.error(
        `Failed to create content item: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  async getUnnotifiedItems(): Promise<ContentItem[]> {
    return this.contentItemsRepository.findUnnotified();
  }

  async markAsNotified(id: string): Promise<ContentItem> {
    this.logger.log(`Marking content item as notified: ${id}`);
    return this.contentItemsRepository.markAsNotified(id);
  }

  async getRecentItems(limit: number = 10): Promise<ContentItem[]> {
    return this.contentItemsRepository.findRecent(limit);
  }

  async getItemsBySource(sourceId: string): Promise<ContentItem[]> {
    return this.contentItemsRepository.findBySourceId(sourceId);
  }
} 
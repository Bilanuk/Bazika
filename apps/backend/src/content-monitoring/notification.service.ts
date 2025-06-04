import { Injectable, Logger } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ContentItem } from '@database';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private telegramService: TelegramService) {}

  async notifyNewContent(contentItem: ContentItem): Promise<void> {
    this.logger.log(
      `Sending notifications for new content: ${contentItem.title}`,
    );

    try {
      await this.telegramService.sendNewContentNotification(contentItem);
    } catch (error) {
      this.logger.error(
        `Failed to send notifications for content: ${contentItem.title}`,
        error.stack,
      );
    }
  }

  async notifyBulkContent(contentItems: ContentItem[]): Promise<void> {
    if (contentItems.length === 0) {
      return;
    }

    this.logger.log(
      `Sending bulk notifications for ${contentItems.length} items`,
    );

    try {
      await this.telegramService.sendBulkNotification(contentItems);
    } catch (error) {
      this.logger.error(
        `Failed to send bulk notifications for ${contentItems.length} items`,
        error.stack,
      );
    }
  }

  async testNotifications(): Promise<{ telegram: boolean }> {
    this.logger.log('Testing notification services...');

    const results = {
      telegram: await this.telegramService.testConnection(),
    };

    this.logger.log(`Notification test results:`, results);
    return results;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import { ContentItem } from '@database';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot | null = null;
  private readonly chatId: string;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';

    if (token) {
      try {
        this.bot = new TelegramBot(token, { polling: false });
        this.logger.log('Telegram bot initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Telegram bot', error.stack);
      }
    } else {
      this.logger.warn(
        'Telegram bot token not provided, notifications disabled',
      );
    }
  }

  async sendNewContentNotification(contentItem: ContentItem): Promise<boolean> {
    if (!this.bot || !this.chatId) {
      this.logger.warn('Telegram bot not configured, skipping notification');
      return false;
    }

    try {
      const message = this.formatContentMessage(contentItem);
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      });

      this.logger.log(`Sent Telegram notification for: ${contentItem.title}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send Telegram notification: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async sendBulkNotification(contentItems: ContentItem[]): Promise<boolean> {
    if (!this.bot || !this.chatId || contentItems.length === 0) {
      return false;
    }

    try {
      const message = this.formatBulkMessage(contentItems);
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });

      this.logger.log(
        `Sent bulk Telegram notification for ${contentItems.length} items`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send bulk Telegram notification: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  private formatContentMessage(contentItem: ContentItem): string {
    const title = this.escapeHtml(contentItem.title);
    const description = contentItem.description
      ? this.escapeHtml(contentItem.description.substring(0, 200) + '...')
      : '';

    return `
🆕 <b>New Content Available!</b>

📺 <b>${title}</b>

${description ? `📝 ${description}\n` : ''}
🔗 <a href="${contentItem.url}">View Content</a>

⏰ Published: ${contentItem.publishedAt.toLocaleString()}
    `.trim();
  }

  private formatBulkMessage(contentItems: ContentItem[]): string {
    const header = `🆕 <b>${contentItems.length} New Items Available!</b>\n\n`;

    const items = contentItems
      .slice(0, 10) // Limit to 10 items to avoid message length limits
      .map((item, index) => {
        const title = this.escapeHtml(item.title.substring(0, 60));
        return `${index + 1}. <a href="${item.url}">${title}</a>`;
      })
      .join('\n');

    const footer =
      contentItems.length > 10
        ? `\n\n... and ${contentItems.length - 10} more items`
        : '';

    return header + items + footer;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async testConnection(): Promise<boolean> {
    if (!this.bot) {
      return false;
    }

    try {
      const me = await this.bot.getMe();
      this.logger.log(`Telegram bot connected: @${me.username}`);
      return true;
    } catch (error) {
      this.logger.error('Telegram bot connection test failed', error.stack);
      return false;
    }
  }
}

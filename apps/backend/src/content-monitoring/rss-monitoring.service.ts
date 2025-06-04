import { Injectable, Logger } from '@nestjs/common';
import * as Parser from 'rss-parser';
import { Source } from '@database';
import {
  IContentItem,
  IRSSItem,
} from '../common/interfaces/content-item.interface';

@Injectable()
export class RssMonitoringService {
  private readonly logger = new Logger(RssMonitoringService.name);
  private readonly parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          'nyaa:seeders',
          'nyaa:leechers',
          'nyaa:downloads',
          'nyaa:infoHash',
          'nyaa:categoryId',
          'nyaa:category',
          'nyaa:size',
          'nyaa:comments',
          'nyaa:trusted',
          'nyaa:remake',
        ],
      },
    });
  }

  async fetchRSSFeed(source: Source): Promise<IContentItem[]> {
    try {
      this.logger.log(`Fetching RSS feed from: ${source.url}`);

      const feed = await this.parser.parseURL(source.url);
      const contentItems: IContentItem[] = [];

      for (const item of feed.items) {
        const contentItem = this.parseRSSItem(item as IRSSItem);
        if (contentItem) {
          contentItems.push(contentItem);
        }
      }

      this.logger.log(
        `Fetched ${contentItems.length} items from ${source.name}`,
      );
      return contentItems;
    } catch (error) {
      this.logger.error(
        `Failed to fetch RSS feed from ${source.url}: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  private parseRSSItem(item: IRSSItem): IContentItem | null {
    try {
      if (!item.title || !item.link || !item.guid) {
        this.logger.warn('RSS item missing required fields', item);
        return null;
      }

      const publishedAt = item.isoDate
        ? new Date(item.isoDate)
        : item.pubDate
          ? new Date(item.pubDate)
          : new Date();

      return {
        title: item.title,
        description: item.contentSnippet || item.description || '',
        url: item.link,
        guid: item.guid,
        publishedAt,
      };
    } catch (error) {
      this.logger.error(
        `Failed to parse RSS item: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  isNyaaAnimeItem(title: string): boolean {
    // Simple heuristic to detect anime content
    const animeKeywords = [
      'anime',
      'episode',
      'ep',
      'season',
      'series',
      'ova',
      'movie',
      '1080p',
      '720p',
      'bd',
      'bluray',
      'web-dl',
      'webrip',
    ];

    const lowerTitle = title.toLowerCase();
    return animeKeywords.some((keyword) => lowerTitle.includes(keyword));
  }

  extractEpisodeInfo(title: string): {
    seriesName?: string;
    episodeNumber?: number;
  } {
    // Extract series name and episode number from title
    // This is a basic implementation - you might want to make it more sophisticated
    const episodeMatch = title.match(/(?:episode|ep\.?\s*)(\d+)/i);
    const episodeNumber = episodeMatch
      ? parseInt(episodeMatch[1], 10)
      : undefined;

    // Try to extract series name (everything before episode info or quality info)
    const seriesMatch = title.match(
      /^(.+?)(?:\s*-?\s*(?:episode|ep\.?\s*\d+|s\d+e\d+|\d{3,4}p))/i,
    );
    const seriesName = seriesMatch ? seriesMatch[1].trim() : title;

    return { seriesName, episodeNumber };
  }
}

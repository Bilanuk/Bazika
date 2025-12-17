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
      // Add XML parsing options to handle malformed XML
      xml2js: {
        normalize: true,
        normalizeTags: true,
        explicitArray: false,
      },
    });
  }

  /**
   * Sanitize XML content to fix common parsing issues
   */
  private sanitizeXml(xmlContent: string): string {
    return (
      xmlContent
        // Fix common entity issues
        .replace(/&(?![a-zA-Z0-9#]{1,7};)/g, '&amp;')
        // Remove or fix invalid control characters
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Fix unclosed CDATA sections
        .replace(/<!\[CDATA\[(?!.*\]\]>)/g, '<![CDATA[')
        // Ensure CDATA sections are properly closed
        .replace(/\]\]>/g, ']]>')
        // Fix malformed HTML entities in content
        .replace(/&([a-zA-Z0-9]+)(?![a-zA-Z0-9;])/g, '&$1;')
    );
  }

  /**
   * Simple RSS parser using regex for feeds that the standard parser can't handle
   */
  private parseSimpleRSS(xmlContent: string): any {
    try {
      // Extract basic RSS information using regex
      const titleMatch = xmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
      const descriptionMatch = xmlContent.match(
        /<description[^>]*>(.*?)<\/description>/i,
      );
      const linkMatch = xmlContent.match(/<link[^>]*>(.*?)<\/link>/i);

      // Extract all items
      const itemMatches = xmlContent.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];

      const items = itemMatches.map((itemXml) => {
        const item: any = {};

        // Extract basic item fields
        const itemTitle = itemXml.match(/<title[^>]*>(.*?)<\/title>/i);
        const itemLink = itemXml.match(/<link[^>]*>(.*?)<\/link>/i);
        const itemGuid = itemXml.match(/<guid[^>]*>(.*?)<\/guid>/i);
        const itemPubDate = itemXml.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
        const itemDescription = itemXml.match(
          /<description[^>]*>(.*?)<\/description>/i,
        );

        // Extract Nyaa-specific fields
        const infoHash = itemXml.match(
          /<nyaa:infoHash[^>]*>(.*?)<\/nyaa:infoHash>/i,
        );
        const seeders = itemXml.match(
          /<nyaa:seeders[^>]*>(.*?)<\/nyaa:seeders>/i,
        );
        const leechers = itemXml.match(
          /<nyaa:leechers[^>]*>(.*?)<\/nyaa:leechers>/i,
        );
        const downloads = itemXml.match(
          /<nyaa:downloads[^>]*>(.*?)<\/nyaa:downloads>/i,
        );
        const categoryId = itemXml.match(
          /<nyaa:categoryId[^>]*>(.*?)<\/nyaa:categoryId>/i,
        );
        const category = itemXml.match(
          /<nyaa:category[^>]*>(.*?)<\/nyaa:category>/i,
        );
        const size = itemXml.match(/<nyaa:size[^>]*>(.*?)<\/nyaa:size>/i);

        item.title = itemTitle ? itemTitle[1].trim() : '';
        item.link = itemLink ? itemLink[1].trim() : '';
        item.guid = itemGuid ? itemGuid[1].trim() : '';
        item.pubDate = itemPubDate ? itemPubDate[1].trim() : '';
        item.isoDate = item.pubDate;
        item.description = itemDescription ? itemDescription[1].trim() : '';
        item.contentSnippet = item.description;

        // Add Nyaa-specific fields
        if (infoHash) item['nyaa:infoHash'] = infoHash[1].trim();
        if (seeders) item['nyaa:seeders'] = seeders[1].trim();
        if (leechers) item['nyaa:leechers'] = leechers[1].trim();
        if (downloads) item['nyaa:downloads'] = downloads[1].trim();
        if (categoryId) item['nyaa:categoryId'] = categoryId[1].trim();
        if (category) item['nyaa:category'] = category[1].trim();
        if (size) item['nyaa:size'] = size[1].trim();

        return item;
      });

      return {
        title: titleMatch ? titleMatch[1].trim() : '',
        description: descriptionMatch ? descriptionMatch[1].trim() : '',
        link: linkMatch ? linkMatch[1].trim() : '',
        items,
      };
    } catch (error) {
      this.logger.error(`Simple RSS parsing failed: ${error.message}`);
      throw error;
    }
  }

  async fetchRSSFeed(source: Source): Promise<IContentItem[]> {
    try {
      this.logger.log(`Fetching RSS feed from: ${source.url}`);

      // Fetch the RSS content manually first to sanitize it
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSS-Bot/1.0)',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlContent = await response.text();
      this.logger.debug(
        `Fetched XML content length: ${xmlContent.length} characters`,
      );

      // Log first 1000 characters of XML for debugging
      if (xmlContent.length > 0) {
        this.logger.debug(
          `XML preview: ${xmlContent.substring(0, 1000)}...`,
        );
      }

      // Check if the content is actually HTML (common issue with Nyaa)
      if (xmlContent.trim().toLowerCase().startsWith('<!doctype html')) {
        this.logger.error(
          `Received HTML instead of RSS XML from ${source.url}. This usually means the URL is incorrect or the feed doesn't exist.`,
        );
        return [];
      }

      // Check if it's a valid RSS/XML structure
      if (!xmlContent.includes('<rss') && !xmlContent.includes('<feed')) {
        this.logger.error(
          `Content doesn't appear to be RSS or Atom feed from ${source.url}`,
        );
        this.logger.debug(`Content type: ${response.headers.get('content-type')}`);
        return [];
      }

      // Sanitize the XML content
      const sanitizedXml = this.sanitizeXml(xmlContent);
      this.logger.debug(
        `Sanitized XML content length: ${sanitizedXml.length} characters`,
      );

      // Parse the sanitized XML with better error handling
      let feed;
      try {
        feed = await this.parser.parseString(sanitizedXml);
      } catch (parseError) {
        this.logger.error(
          `RSS parsing failed for ${source.url}: ${parseError.message}`,
        );
        
        // Try to extract some basic info about the XML structure
        const rssMatch = sanitizedXml.match(/<rss[^>]*>/i);
        const channelMatch = sanitizedXml.match(/<channel[^>]*>/i);
        const itemsMatch = sanitizedXml.match(/<item[^>]*>/gi);
        
        this.logger.debug(`RSS tag found: ${!!rssMatch}`);
        this.logger.debug(`Channel tag found: ${!!channelMatch}`);
        this.logger.debug(`Items found: ${itemsMatch ? itemsMatch.length : 0}`);
        
        // Try fallback simple parser
        this.logger.log(`Attempting fallback RSS parsing for ${source.url}`);
        try {
          feed = this.parseSimpleRSS(sanitizedXml);
          this.logger.log(`Fallback parsing successful, found ${feed.items?.length || 0} items`);
        } catch (fallbackError) {
          this.logger.error(`Fallback parsing also failed: ${fallbackError.message}`);
          throw parseError; // Throw original error
        }
      }

      const contentItems: IContentItem[] = [];

      // Handle different RSS structures
      let items = [];
      if (feed.items) {
        items = feed.items;
      } else if (feed.rss && feed.rss.channel && feed.rss.channel.item) {
        items = Array.isArray(feed.rss.channel.item) 
          ? feed.rss.channel.item 
          : [feed.rss.channel.item];
      } else if (feed.channel && feed.channel.item) {
        items = Array.isArray(feed.channel.item) 
          ? feed.channel.item 
          : [feed.channel.item];
      }

      if (!items || items.length === 0) {
        this.logger.warn(`No items found in RSS feed: ${source.url}`);
        this.logger.debug(`Feed structure: ${JSON.stringify(Object.keys(feed), null, 2)}`);
        return [];
      }

      for (const item of items) {
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

      // Log additional details for debugging
      if (error.message.includes('Invalid character in entity name')) {
        this.logger.error(
          `XML parsing error detected. This usually indicates malformed XML in the RSS feed. URL: ${source.url}`,
        );
      } else if (error.message.includes('Cannot read properties of undefined')) {
        this.logger.error(
          `RSS structure parsing error. The feed might not be in standard RSS format. URL: ${source.url}`,
        );
      }

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
        infoHash: item['nyaa:infoHash'],
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

  /**
   * Backfill RSS feed data by fetching multiple pages with throttling
   */
  async backfillRSSFeed(
    source: Source,
    options: {
      startPage?: number;
      endPage?: number;
      throttleMs?: number;
      onProgress?: (
        page: number,
        totalPages: number,
        itemsFound: number,
      ) => void;
    } = {},
  ): Promise<IContentItem[]> {
    const {
      startPage = 1,
      endPage = 10,
      throttleMs = 2000, // 2 seconds between requests
      onProgress,
    } = options;

    this.logger.log(
      `Starting RSS backfill for ${source.name} from page ${startPage} to ${endPage}`,
    );

    const allContentItems: IContentItem[] = [];
    const totalPages = endPage - startPage + 1;

    for (let page = startPage; page <= endPage; page++) {
      try {
        this.logger.log(`Fetching page ${page} for ${source.name}`);

        // Construct paginated URL
        const paginatedUrl = this.buildPaginatedUrl(source.url, page);

        // Create a temporary source object with paginated URL
        const paginatedSource = { ...source, url: paginatedUrl };

        // Fetch the page
        const pageItems = await this.fetchRSSFeed(paginatedSource);

        if (pageItems.length === 0) {
          this.logger.log(`No items found on page ${page}, stopping backfill`);
          break;
        }

        allContentItems.push(...pageItems);

        // Call progress callback if provided
        if (onProgress) {
          onProgress(page, totalPages, allContentItems.length);
        }

        this.logger.log(
          `Page ${page}: Found ${pageItems.length} items (total: ${allContentItems.length})`,
        );

        // Throttle requests to avoid overwhelming the server
        if (page < endPage && throttleMs > 0) {
          this.logger.debug(
            `Throttling for ${throttleMs}ms before next request`,
          );
          await new Promise((resolve) => setTimeout(resolve, throttleMs));
        }
      } catch (error) {
        this.logger.error(
          `Failed to fetch page ${page} for ${source.name}: ${error.message}`,
        );

        // Continue with next page instead of failing completely
        continue;
      }
    }

    this.logger.log(
      `Backfill completed for ${source.name}: ${allContentItems.length} total items from ${endPage - startPage + 1} pages`,
    );

    return allContentItems;
  }

  /**
   * Build paginated URL for RSS feeds that support pagination
   */
  private buildPaginatedUrl(baseUrl: string, page: number): string {
    try {
      const url = new URL(baseUrl);
      this.logger.debug(`Building paginated URL from base: ${baseUrl}, page: ${page}`);

      // Check if it's a Nyaa URL and add page parameter
      if (url.hostname.includes('nyaa.si')) {
        // For Nyaa RSS feeds, we need to handle pagination correctly
        if (url.searchParams.has('page') && url.searchParams.get('page') === 'rss') {
          // This is a proper RSS URL like https://nyaa.si/?page=rss&c=1_2
          // For pagination, we need to add the 'p' parameter
          url.searchParams.set('p', page.toString());
        } else if (url.searchParams.has('u')) {
          // This is a user-specific URL like https://nyaa.si/?u=subsplease
          // We need to convert it to RSS format and add pagination
          const username = url.searchParams.get('u');
          const newUrl = new URL(url.origin + url.pathname);
          newUrl.searchParams.set('page', 'rss');
          newUrl.searchParams.set('u', username);
          if (page > 1) {
            newUrl.searchParams.set('p', page.toString());
          }
          const finalUrl = newUrl.toString();
          this.logger.debug(`Built Nyaa RSS URL: ${finalUrl}`);
          return finalUrl;
        } else {
          // Regular Nyaa URL, convert to RSS format
          url.searchParams.set('page', 'rss');
          if (page > 1) {
            url.searchParams.set('p', page.toString());
          }
        }
        
        const finalUrl = url.toString();
        this.logger.debug(`Built Nyaa RSS URL: ${finalUrl}`);
        return finalUrl;
      }

      // For other RSS feeds, try common pagination patterns
      if (baseUrl.includes('?')) {
        const finalUrl = `${baseUrl}&page=${page}`;
        this.logger.debug(`Built paginated URL: ${finalUrl}`);
        return finalUrl;
      } else {
        const finalUrl = `${baseUrl}?page=${page}`;
        this.logger.debug(`Built paginated URL: ${finalUrl}`);
        return finalUrl;
      }
    } catch (error) {
      this.logger.warn(`Failed to parse URL for pagination: ${baseUrl}`);
      // Fallback to simple string concatenation
      if (baseUrl.includes('?')) {
        const finalUrl = `${baseUrl}&page=${page}`;
        this.logger.debug(`Built paginated URL (fallback): ${finalUrl}`);
        return finalUrl;
      } else {
        const finalUrl = `${baseUrl}?page=${page}`;
        this.logger.debug(`Built paginated URL (fallback): ${finalUrl}`);
        return finalUrl;
      }
    }
  }
}

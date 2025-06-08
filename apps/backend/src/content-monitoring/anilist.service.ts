import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AniListAnime {
  id: number;
  coverImage: {
    medium: string;
    large: string;
    extraLarge: string;
  };
  bannerImage: string | null;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  description: string;
}

export interface AniListResponse {
  data: {
    Page: {
      media: AniListAnime[];
    };
  };
}

@Injectable()
export class AniListService {
  private readonly logger = new Logger(AniListService.name);
  private readonly apiUrl = 'https://graphql.anilist.co';
  private readonly rateLimit = 30; // 30 requests per minute
  private readonly rateLimitWindow = 60 * 1000; // 1 minute in ms

  private requestQueue: Array<() => Promise<void>> = [];
  private requestTimes: number[] = [];
  private isProcessingQueue = false;

  constructor(private prisma: PrismaService) {}

  /**
   * Search for anime on AniList
   */
  async searchAnime(searchTerm: string): Promise<AniListAnime[]> {
    const query = `
      query ($search: String!) {
        Page {
          media(search: $search, type: ANIME) {
            id
            coverImage {
              medium
              large
              extraLarge
            }
            bannerImage
            title {
              romaji
              english
              native
            }
            description
          }
        }
      }
    `;

    try {
      const response = await this.makeRateLimitedRequest(query, {
        search: searchTerm,
      });

      return response.data.Page.media;
    } catch (error) {
      this.logger.error(
        `Failed to search AniList for "${searchTerm}": ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Make a rate-limited request to AniList API
   */
  private async makeRateLimitedRequest(
    query: string,
    variables: Record<string, any>,
  ): Promise<AniListResponse> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await this.makeRequest(query, variables);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Process the request queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      // Clean up old request times
      const now = Date.now();
      this.requestTimes = this.requestTimes.filter(
        (time) => now - time < this.rateLimitWindow,
      );

      // Check if we can make a request
      if (this.requestTimes.length >= this.rateLimit) {
        // Wait until we can make another request
        const oldestRequest = Math.min(...this.requestTimes);
        const waitTime = this.rateLimitWindow - (now - oldestRequest);
        this.logger.debug(`Rate limit reached, waiting ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // Execute the next request
      const request = this.requestQueue.shift();
      if (request) {
        this.requestTimes.push(now);
        await request();

        // Small delay between requests to be respectful
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Make the actual HTTP request to AniList
   */
  private async makeRequest(
    query: string,
    variables: Record<string, any>,
  ): Promise<AniListResponse> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `AniList API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`AniList GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    return data;
  }

  /**
   * Find the best matching anime from search results
   */
  findBestMatch(
    searchResults: AniListAnime[],
    originalTitle: string,
  ): AniListAnime | null {
    if (searchResults.length === 0) {
      return null;
    }

    // Normalize the original title for comparison
    const normalizedOriginal = this.normalizeTitle(originalTitle);

    // Score each result based on title similarity
    const scoredResults = searchResults.map((anime) => {
      const romajiScore = this.calculateSimilarity(
        normalizedOriginal,
        this.normalizeTitle(anime.title.romaji),
      );
      const englishScore = anime.title.english
        ? this.calculateSimilarity(
            normalizedOriginal,
            this.normalizeTitle(anime.title.english),
          )
        : 0;

      return {
        anime,
        score: Math.max(romajiScore, englishScore),
      };
    });

    // Sort by score and return the best match if it's good enough
    scoredResults.sort((a, b) => b.score - a.score);
    const bestMatch = scoredResults[0];

    // Only return if similarity is above threshold
    if (bestMatch.score > 0.6) {
      this.logger.debug(
        `Best match for "${originalTitle}": "${bestMatch.anime.title.romaji}" (score: ${bestMatch.score})`,
      );
      return bestMatch.anime;
    }

    return null;
  }

  /**
   * Normalize title for comparison
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Calculate similarity between two strings (simple Jaccard similarity)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(' '));
    const words2 = new Set(str2.split(' '));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Update serial with AniList data
   */
  async updateSerialWithAniListData(
    serialId: string,
    anilistAnime: AniListAnime,
  ): Promise<void> {
    try {
      await this.prisma.serial.update({
        where: { id: serialId },
        data: {
          anilistId: anilistAnime.id,
          coverImage: anilistAnime.coverImage.extraLarge,
          bannerImage: anilistAnime.bannerImage,
          titleRomaji: anilistAnime.title.romaji,
          titleEnglish: anilistAnime.title.english,
          titleNative: anilistAnime.title.native,
          anilistDescription: anilistAnime.description,
          imageUrl: anilistAnime.coverImage.extraLarge, // Use extraLarge for highest quality
          description: anilistAnime.description || 'No description available',
          lastAnilistSync: new Date(),
        },
      });

      this.logger.log(
        `Updated serial ${serialId} with AniList data for "${anilistAnime.title.romaji}"`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update serial ${serialId} with AniList data: ${error.message}`,
      );
    }
  }

  /**
   * Check if serial needs AniList sync (hasn't been synced or synced more than 7 days ago)
   */
  needsAniListSync(serial: {
    lastAnilistSync: Date | null;
    anilistId: number | null;
  }): boolean {
    if (!serial.anilistId || !serial.lastAnilistSync) {
      return true;
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return serial.lastAnilistSync < weekAgo;
  }
}

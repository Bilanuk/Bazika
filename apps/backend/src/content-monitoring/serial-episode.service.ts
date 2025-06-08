import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnimeParserService, ParsedAnimeTitle } from './anime-parser.service';
import { AniListService } from './anilist.service';
import { Serial, Episode } from '@database';

@Injectable()
export class SerialEpisodeService {
  private readonly logger = new Logger(SerialEpisodeService.name);

  constructor(
    private prisma: PrismaService,
    private animeParser: AnimeParserService,
    private aniListService: AniListService,
  ) {}

  /**
   * Find or create a serial based on parsed anime title
   */
  async findOrCreateSerial(parsedTitle: ParsedAnimeTitle): Promise<Serial> {
    const seriesTitle = this.animeParser.generateSeriesTitle(parsedTitle);
    const normalizedSeriesName = this.animeParser.normalizeSeriesName(
      parsedTitle.seriesName,
    );

    // Try to find existing serial by exact title match first
    let serial = await this.prisma.serial.findFirst({
      where: {
        title: {
          equals: seriesTitle,
          mode: 'insensitive',
        },
      },
    });

    // If not found, try normalized matching
    if (!serial) {
      const existingSerials = await this.prisma.serial.findMany({
        select: { id: true, title: true },
      });

      // Find by normalized name comparison
      for (const existingSerial of existingSerials) {
        const normalizedExistingTitle = this.animeParser.normalizeSeriesName(
          existingSerial.title,
        );
        if (normalizedExistingTitle === normalizedSeriesName) {
          serial = await this.prisma.serial.findUnique({
            where: { id: existingSerial.id },
          });
          this.logger.debug(
            `Found existing serial by normalized match: "${existingSerial.title}" matches "${parsedTitle.seriesName}"`,
          );
          break;
        }
      }
    }

    if (!serial) {
      // Create new serial
      this.logger.log(
        `Creating new serial: ${seriesTitle} (normalized: ${normalizedSeriesName})`,
      );
      serial = await this.prisma.serial.create({
        data: {
          title: seriesTitle,
          description: `Auto-generated from content monitoring: ${parsedTitle.originalTitle}`,
          rating: 0,
          imageUrl: '',
        },
      });

      // Fetch AniList data for new serial
      await this.enrichSerialWithAniListData(serial, parsedTitle.seriesName);
    } else {
      // Check if we need to update AniList data
      if (this.aniListService.needsAniListSync(serial)) {
        await this.enrichSerialWithAniListData(serial, parsedTitle.seriesName);
      }
    }

    return serial;
  }

  /**
   * Enrich serial with AniList data
   */
  private async enrichSerialWithAniListData(
    serial: Serial,
    searchTerm: string,
  ): Promise<void> {
    try {
      // Search for anime on AniList
      const searchResults = await this.aniListService.searchAnime(searchTerm);

      if (searchResults.length === 0) {
        return;
      }

      // Find the best match
      const bestMatch = this.aniListService.findBestMatch(
        searchResults,
        searchTerm,
      );

      if (bestMatch) {
        this.logger.log(
          `Found AniList match for "${searchTerm}": "${bestMatch.title.romaji}"`,
        );

        // Update serial with AniList data
        await this.aniListService.updateSerialWithAniListData(
          serial.id,
          bestMatch,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to enrich serial with AniList data: ${error.message}`,
      );
    }
  }

  /**
   * Find or create an episode for a serial
   */
  async findOrCreateEpisode(
    serial: Serial,
    parsedTitle: ParsedAnimeTitle,
    contentUrl: string,
  ): Promise<Episode | null> {
    if (!parsedTitle.episodeNumber) {
      return null;
    }

    // Try to find existing episode
    let episode = await this.prisma.episode.findFirst({
      where: {
        serialId: serial.id,
        episodeNumber: parsedTitle.episodeNumber,
      },
    });

    if (!episode) {
      // Create new episode
      const episodeTitle = this.animeParser.generateEpisodeTitle(parsedTitle);
      this.logger.log(
        `Creating new episode: ${episodeTitle} for serial: ${serial.title}`,
      );

      episode = await this.prisma.episode.create({
        data: {
          title: episodeTitle,
          url: contentUrl,
          serialId: serial.id,
          episodeNumber: parsedTitle.episodeNumber,
        },
      });
    } else {
      // Update episode URL if it's empty
      if (!episode.url && contentUrl) {
        this.logger.debug(`Updating episode URL for: ${episode.title}`);
        episode = await this.prisma.episode.update({
          where: { id: episode.id },
          data: { url: contentUrl },
        });
      }
    }

    return episode;
  }

  /**
   * Process anime content and link to serial/episode
   */
  async processAnimeContent(
    title: string,
    contentUrl: string,
  ): Promise<{
    serial: Serial | null;
    episode: Episode | null;
    parsedTitle: ParsedAnimeTitle | null;
  }> {
    try {
      // Parse the anime title
      const parsedTitle = this.animeParser.parseAnimeTitle(title);
      if (!parsedTitle) {
        this.logger.debug(`Could not parse anime title: ${title}`);
        return { serial: null, episode: null, parsedTitle: null };
      }

      // Find or create serial (with AniList enrichment)
      const serial = await this.findOrCreateSerial(parsedTitle);

      // Find or create episode
      const episode = await this.findOrCreateEpisode(
        serial,
        parsedTitle,
        contentUrl,
      );

      return { serial, episode, parsedTitle };
    } catch (error) {
      this.logger.error(
        `Failed to process anime content "${title}": ${error.message}`,
      );
      return { serial: null, episode: null, parsedTitle: null };
    }
  }

  /**
   * Manually sync existing serials with AniList (for batch updates)
   */
  async syncExistingSerialsWithAniList(limit: number = 10): Promise<void> {
    this.logger.log(
      `Starting AniList sync for existing serials (limit: ${limit})`,
    );

    const serialsToSync = await this.prisma.serial.findMany({
      where: {
        OR: [
          { anilistId: null },
          { lastAnilistSync: null },
          {
            lastAnilistSync: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            },
          },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    this.logger.log(`Found ${serialsToSync.length} serials to sync`);

    for (const serial of serialsToSync) {
      await this.enrichSerialWithAniListData(serial, serial.title);

      // Small delay between syncs to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    this.logger.log('AniList sync completed');
  }
}

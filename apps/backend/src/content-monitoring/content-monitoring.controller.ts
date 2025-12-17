import { Controller, Post, Get, Body, Logger, Query } from '@nestjs/common';
import { ContentMonitoringService } from './content-monitoring.service';
import { NotificationService } from './notification.service';
import { SerialEpisodeService } from './serial-episode.service';
import { Public } from '@/decorators';

@Controller('content-monitoring')
export class ContentMonitoringController {
  private readonly logger = new Logger(ContentMonitoringController.name);

  constructor(
    private contentMonitoringService: ContentMonitoringService,
    private notificationService: NotificationService,
    private serialEpisodeService: SerialEpisodeService,
  ) {}

  @Public()
  @Post('add-nyaa-source')
  async addNyaaSource(@Body() body: { name: string; rssUrl: string }) {
    this.logger.log(`Adding Nyaa source: ${body.name}`);
    await this.contentMonitoringService.addNyaaSource(body.name, body.rssUrl);
    return { success: true, message: 'Nyaa source added successfully' };
  }

  @Post('manual-monitor')
  async manualMonitor() {
    this.logger.log('Starting manual monitoring');
    const result = await this.contentMonitoringService.manualMonitor();
    return {
      success: true,
      message: `Manual monitoring completed`,
      data: result,
    };
  }

  @Post('sync-anilist')
  async syncAniList(@Query('limit') limit?: string) {
    this.logger.log('Starting AniList sync');
    const syncLimit = limit ? parseInt(limit, 10) : 10;

    await this.serialEpisodeService.syncExistingSerialsWithAniList(syncLimit);

    return {
      success: true,
      message: `AniList sync completed for up to ${syncLimit} serials`,
    };
  }

  @Public()
  @Post('backfill')
  async backfillSources(
    @Body()
    body: {
      sourceIds: string[];
      startPage?: number;
      endPage?: number;
      throttleMs?: number;
    },
  ) {
    this.logger.log(
      `Starting backfill for sources: ${body.sourceIds.join(', ')}`,
    );

    const { sourceIds, startPage = 1, endPage = 10, throttleMs = 2000 } = body;

    if (!sourceIds || sourceIds.length === 0) {
      return {
        success: false,
        message: 'No source IDs provided',
      };
    }

    if (startPage < 1 || endPage < startPage) {
      return {
        success: false,
        message: 'Invalid page range',
      };
    }

    if (endPage - startPage > 50) {
      return {
        success: false,
        message: 'Page range too large (maximum 50 pages)',
      };
    }

    const result = await this.contentMonitoringService.backfillSources(
      sourceIds,
      {
        startPage,
        endPage,
        throttleMs,
      },
    );

    return {
      success: true,
      message: `Backfill completed: ${result.newItems} new items from ${result.totalItems} total items`,
      data: result,
    };
  }

  @Get('status')
  async getStatus() {
    const status = await this.contentMonitoringService.getMonitoringStatus();
    return {
      success: true,
      data: status,
    };
  }

  @Public()
  @Post('test-notifications')
  async testNotifications() {
    const results = await this.notificationService.testNotifications();
    return {
      success: true,
      message: 'Notification test completed',
      data: results,
    };
  }
}

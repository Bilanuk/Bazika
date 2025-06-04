import { Controller, Post, Get, Body, Logger } from '@nestjs/common';
import { ContentMonitoringService } from './content-monitoring.service';
import { NotificationService } from './notification.service';
import { Public } from '@/decorators';

@Controller('content-monitoring')
export class ContentMonitoringController {
  private readonly logger = new Logger(ContentMonitoringController.name);

  constructor(
    private contentMonitoringService: ContentMonitoringService,
    private notificationService: NotificationService,
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

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ContentMonitoringService } from './content-monitoring.service';
import { ContentItemsService } from './content-items.service';
import { ContentItemsRepository } from './content-items.repository';
import { RssMonitoringService } from './rss-monitoring.service';
import { NotificationService } from './notification.service';
import { TelegramService } from './telegram.service';
import { ContentMonitoringController } from './content-monitoring.controller';
import { SourcesModule } from '../sources/sources.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ScheduleModule.forRoot(), SourcesModule, PrismaModule],
  controllers: [ContentMonitoringController],
  providers: [
    ContentMonitoringService,
    ContentItemsService,
    ContentItemsRepository,
    RssMonitoringService,
    NotificationService,
    TelegramService,
  ],
  exports: [ContentMonitoringService, ContentItemsService],
})
export class ContentMonitoringModule {} 
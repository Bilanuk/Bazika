import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ContentMonitoringService } from './content-monitoring.service';
import { ContentItemsService } from './content-items.service';
import { ContentItemsRepository } from './content-items.repository';
import { RssMonitoringService } from './rss-monitoring.service';
import { NotificationService } from './notification.service';
import { TelegramService } from './telegram.service';
import { AnimeParserService } from './anime-parser.service';
import { SerialEpisodeService } from './serial-episode.service';
import { AniListService } from './anilist.service';
import { ContentMonitoringController } from './content-monitoring.controller';
import { SourcesModule } from '../sources/sources.module';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [ScheduleModule.forRoot(), SourcesModule, PrismaModule, QueueModule],
  controllers: [ContentMonitoringController],
  providers: [
    ContentMonitoringService,
    ContentItemsService,
    ContentItemsRepository,
    RssMonitoringService,
    NotificationService,
    TelegramService,
    AnimeParserService,
    SerialEpisodeService,
    AniListService,
  ],
  exports: [ContentMonitoringService, ContentItemsService],
})
export class ContentMonitoringModule {}

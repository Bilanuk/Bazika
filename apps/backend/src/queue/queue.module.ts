import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TorrentDownloadProcessor } from './processors/torrent-download.processor';
import { TorrentDownloadService } from './services/torrent-download.service';
import { MinioService } from './services/minio.service';
import { BullBoardService } from './services/bull-board.service';
import { QueueController } from './queue.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'torrent-download',
    }),
    PrismaModule,
  ],
  controllers: [QueueController],
  providers: [
    TorrentDownloadProcessor,
    TorrentDownloadService,
    MinioService,
    BullBoardService,
  ],
  exports: [TorrentDownloadService, BullBoardService],
})
export class QueueModule {}

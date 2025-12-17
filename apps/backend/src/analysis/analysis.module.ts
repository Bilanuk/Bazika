import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AnalysisService } from './analysis.service';
import { AnalysisProcessor } from './analysis.processor';
import { AnalysisResolver } from './analysis.resolver';
import { AnalysisController } from './analysis.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-analysis',
    }),
    PrismaModule,
    QueueModule,
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisProcessor, AnalysisResolver],
  exports: [AnalysisService, BullModule],
})
export class AnalysisModule {}

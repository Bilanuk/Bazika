import { Module } from '@nestjs/common';
import { ContentItemsService } from './content-items.service';
import { ContentItemsController } from './content-items.controller';
import { QueueModule } from '../queue/queue.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [QueueModule, PrismaModule, AnalysisModule],
  controllers: [ContentItemsController],
  providers: [ContentItemsService],
  exports: [ContentItemsService],
})
export class ContentItemsModule {}

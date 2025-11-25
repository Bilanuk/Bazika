import { Module } from '@nestjs/common';
import { ContentItemsService } from './content-items.service';
import { QueueModule } from '../queue/queue.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [QueueModule, PrismaModule],
  controllers: [],
  providers: [ContentItemsService],
  exports: [ContentItemsService],
})
export class ContentItemsModule {} 
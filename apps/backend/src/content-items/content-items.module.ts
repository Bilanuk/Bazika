import { Module } from '@nestjs/common';
import { ContentItemsService } from './content-items.service';
import { ContentItemsController } from './content-items.controller';
import { QueueModule } from '../queue/queue.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [QueueModule, PrismaModule],
  controllers: [ContentItemsController],
  providers: [ContentItemsService],
  exports: [ContentItemsService],
})
export class ContentItemsModule {} 
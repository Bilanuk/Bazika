import {
  Controller,
  Post,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ContentItemsService } from '@/content-items/content-items.service';

@Controller('api/content-items')
export class ContentItemsController {
  private readonly logger = new Logger(ContentItemsController.name);

  constructor(private contentItemsService: ContentItemsService) {}

  @Post(':id/download')
  async queueDownload(@Param('id') contentItemId: string) {
    try {
      await this.contentItemsService.queueTorrentDownload(contentItemId);

      return {
        success: true,
        message: 'Download queued successfully',
        contentItemId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue download for content item ${contentItemId}: ${error.message}`,
      );

      if (error.message.includes('not found')) {
        throw new HttpException('Content item not found', HttpStatus.NOT_FOUND);
      }

      if (error.message.includes('no torrent URL')) {
        throw new HttpException(
          'Content item has no torrent URL',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        'Failed to queue download',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

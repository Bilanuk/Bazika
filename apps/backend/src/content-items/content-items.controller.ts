import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContentItemsService } from './content-items.service';

@Controller('content-items')
export class ContentItemsController {
  constructor(private readonly contentItemsService: ContentItemsService) {}

  @Post(':id/process')
  @HttpCode(HttpStatus.OK)
  async processContentItem(@Param('id') id: string) {
    // Start torrent download for the content item
    await this.contentItemsService.queueTorrentDownload(id);

    return {
      success: true,
      message: 'Processing started',
      contentItemId: id,
    };
  }

  @Post(':id/reprocess')
  @HttpCode(HttpStatus.OK)
  async reprocessContentItem(
    @Param('id') id: string,
    @Body() body: { episodeId: string },
  ) {
    // Get content item to check if it has a downloaded file
    const contentItem = await this.contentItemsService.getContentItem(id);

    if (!contentItem) {
      return {
        success: false,
        message: 'Content item not found',
      };
    }

    // Determine if we should skip download based on whether file exists
    const skipDownload = !!contentItem.downloadedFileName;

    await this.contentItemsService.reprocessContentItem(
      id,
      body.episodeId,
      skipDownload,
    );

    return {
      success: true,
      message: 'Reprocessing started',
      contentItemId: id,
    };
  }
}

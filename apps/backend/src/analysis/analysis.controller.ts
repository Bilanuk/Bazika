import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('serials')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get(':id/similar')
  async getSimilar(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.analysisService.getSimilarSerials(
      id,
      limit ? Number(limit) : 20,
    );
  }
}








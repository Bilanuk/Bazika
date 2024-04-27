import { Module } from '@nestjs/common';
import { EpisodesResolver } from './episodes.resolver';
import { EpisodesService } from './episodes.service';
import { EpisodesRepository } from './episodes.repository';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  providers: [
    EpisodesResolver,
    EpisodesService,
    EpisodesRepository,
    PrismaService,
  ],
  exports: [EpisodesService],
})
export class EpisodesModule {}

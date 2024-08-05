import { forwardRef, Module } from '@nestjs/common';
import { EpisodesResolver } from './episodes.resolver';
import { EpisodesService } from './episodes.service';
import { EpisodesRepository } from './episodes.repository';
import { PrismaService } from 'src/database/prisma.service';
import { SerialsModule } from '@/serials/serials.module';

@Module({
  imports: [forwardRef(() => SerialsModule)],
  providers: [
    EpisodesResolver,
    EpisodesService,
    EpisodesRepository,
    PrismaService,
  ],
  exports: [EpisodesService],
})
export class EpisodesModule {}

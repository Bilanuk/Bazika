import { forwardRef, Module } from '@nestjs/common';
import { SerialsResolver } from './serials.resolver';
import { SerialsService } from './serials.service';
import { SerialsRepository } from './serials.repository';
import { PrismaService } from 'src/database/prisma.service';
import { EpisodesModule } from '@/episodes/episodes.module';

@Module({
  imports: [forwardRef(() => EpisodesModule)],
  providers: [
    SerialsResolver,
    SerialsService,
    SerialsRepository,
    PrismaService,
  ],
  exports: [SerialsService],
})
export class SerialsModule {}

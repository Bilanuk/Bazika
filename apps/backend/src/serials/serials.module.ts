import { Module } from '@nestjs/common';
import { SerialsResolver } from './serials.resolver';
import { SerialsService } from './serials.service';
import { SerialsRepository } from './serials.repository';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  providers: [
    SerialsResolver,
    SerialsService,
    SerialsRepository,
    PrismaService,
  ],
})
export class SerialsModule {}

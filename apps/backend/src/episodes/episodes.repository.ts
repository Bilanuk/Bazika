import { Injectable, NotFoundException } from '@nestjs/common';
import { Episode, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { PaginationArgs } from '@/common/pagination/pagination.args';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { EpisodeConnection } from '@/episodes/models/episode';

@Injectable()
export class EpisodesRepository {
  constructor(private prisma: PrismaService) {}

  async createEpisode(params: {
    data: Prisma.EpisodeCreateInput;
  }): Promise<Episode> {
    const { data } = params;
    return this.prisma.episode.create({ data });
  }

  public async getEpisode(params: {
    where?: Prisma.EpisodeWhereUniqueInput;
  }): Promise<Episode> {
    const { where } = params;
    return this.prisma.episode.findUnique({ where });
  }

  public async getEpisodes(
    paginationArgs: PaginationArgs,
    where?: Prisma.EpisodeWhereInput,
  ): Promise<EpisodeConnection> {
    return await findManyCursorConnection(
      (args) => this.prisma.episode.findMany({ where, ...args }),
      () =>
        this.prisma.episode.count({
          where,
        }),
      paginationArgs,
    );
  }

  async updateEpisode(params: {
    where: Prisma.EpisodeWhereUniqueInput;
    data: Prisma.EpisodeUpdateInput;
  }): Promise<Episode> {
    const { where, data } = params;
    return this.prisma.episode.update({ where, data }).catch(() => {
      throw new NotFoundException(`Can't find item with id ${where.id}`);
    });
  }

  async deleteEpisode(params: {
    where: Prisma.EpisodeWhereUniqueInput;
  }): Promise<Episode> {
    const { where } = params;
    return this.prisma.episode.delete({ where }).catch(() => {
      throw new NotFoundException(`Can't find item with id ${where.id}`);
    });
  }
}

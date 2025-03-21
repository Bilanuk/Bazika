import { Injectable } from '@nestjs/common';
import { Episode } from '@database';
import { EpisodesRepository } from '@/episodes/episodes.repository';
import { CreateEpisodeInput } from '@/episodes/dto/inputs/create-episode';
import { UpdateEpisodeInput } from '@/episodes/dto/inputs/update-episode';
import { EpisodeConnection } from '@/episodes/models/episode';
import { PaginationArgs } from '@/common/pagination/pagination.args';
import { GetEpisodeArgs } from '@/episodes/dto/args/get-episode';

@Injectable()
export class EpisodesService {
  constructor(private episodesRepository: EpisodesRepository) {}

  public async getEpisode(getEpisodeArgs: GetEpisodeArgs): Promise<Episode> {
    return await this.episodesRepository.getEpisode({
      where: { id: getEpisodeArgs.id },
    });
  }

  public async getEpisodes(
    paginationArgs: PaginationArgs,
    where?: GetEpisodeArgs,
  ): Promise<EpisodeConnection> {
    return this.episodesRepository.getEpisodes(paginationArgs, where);
  }

  public async createEpisode(
    createEpisodeData: CreateEpisodeInput,
  ): Promise<Episode> {
    const maxEpisode = await this.episodesRepository.findLatestEpisodeBySerial(
      createEpisodeData.serialId,
    );

    const episodeNumber = (maxEpisode?.episodeNumber ?? 0) + 1;

    return this.episodesRepository.createEpisode({
      data: {
        title: createEpisodeData.title,
        url: createEpisodeData.url,
        serial: { connect: { id: createEpisodeData.serialId } },
        episodeNumber,
      },
    });
  }

  public async updateEpisode(
    updateEpisodeData: UpdateEpisodeInput,
  ): Promise<Episode> {
    return this.episodesRepository.updateEpisode({
      where: { id: updateEpisodeData.id },
      data: updateEpisodeData,
    });
  }

  public async deleteEpisode(id: string): Promise<Episode> {
    return this.episodesRepository.deleteEpisode({ where: { id: id } });
  }
}

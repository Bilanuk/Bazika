import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Episode, EpisodeConnection } from './models/episode';
import { EpisodesService } from './episodes.service';
import { CreateEpisodeInput } from '@/episodes/dto/inputs/create-episode';
import { UpdateEpisodeInput } from '@/episodes/dto/inputs/update-episode';
import { GetEpisodeArgs } from '@/episodes/dto/args/get-episode';
import { Serial } from '@/serials/models/serial';
import { SerialsService } from '@/serials/serials.service';
import { forwardRef, Inject } from '@nestjs/common';
import { Public } from '@/decorators';

@Resolver(() => Episode)
export class EpisodesResolver {
  constructor(
    private readonly episodesService: EpisodesService,
    @Inject(forwardRef(() => SerialsService))
    private readonly serialsService: SerialsService,
  ) {}

  @Query(() => Episode, { name: 'episode', nullable: false })
  async getEpisode(@Args() getEpisodeArgs: GetEpisodeArgs): Promise<Episode> {
    return this.episodesService.getEpisode(getEpisodeArgs);
  }

  @Query(() => EpisodeConnection)
  @Public()
  async getEpisodes(
    @Args({ name: 'first', type: () => Number, nullable: true }) first?: number,
    @Args({
      name: 'last',
      type: () => Number,
      nullable: true,
    })
    last?: number,
    @Args({ name: 'after', type: () => String, nullable: true }) after?: string,
    @Args({
      name: 'before',
      type: () => String,
      nullable: true,
    })
    before?: string,
    @Args({
      name: 'query',
      type: () => String,
      nullable: true,
    })
    query?: string,
  ): Promise<EpisodeConnection> {
    return this.episodesService.getEpisodes(
      { first, last, before, after },
      { id: query },
    );
  }

  @Mutation(() => Episode)
  async createEpisode(
    @Args('createEpisodeData') createEpisodeData: CreateEpisodeInput,
  ): Promise<Episode> {
    return this.episodesService.createEpisode(createEpisodeData);
  }

  @Mutation(() => Episode)
  async updateEpisode(
    @Args('updateEpisodeData') updateEpisodeData: UpdateEpisodeInput,
  ): Promise<Episode> {
    return this.episodesService.updateEpisode(updateEpisodeData);
  }

  @Mutation(() => Episode)
  async deleteEpisode(@Args('id') id: string): Promise<Episode> {
    return this.episodesService.deleteEpisode(id);
  }

  @ResolveField(() => Serial)
  async serial(@Parent() episode: Episode): Promise<Serial> {
    return this.serialsService.getSerial(episode.serialId);
  }
}

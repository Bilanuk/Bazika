import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Serial, SerialConnection } from './models/serial';
import { SerialsService } from './serials.service';
import { CreateSerialInput } from '@/serials/dto/inputs/create-serial';
import { UpdateSerialInput } from '@/serials/dto/inputs/update-serial';
import { EpisodeConnection } from '@/episodes/models/episode';
import { EpisodesService } from '@/episodes/episodes.service';
import { Public } from '@/decorators';

@Resolver(() => Serial)
export class SerialsResolver {
  constructor(
    private readonly serialsService: SerialsService,
    private readonly episodesService: EpisodesService,
  ) {}

  @Query(() => Serial, { name: 'serial', nullable: false })
  @Public()
  async getSerial(@Args('id') id: string): Promise<Serial> {
    return this.serialsService.getSerial(id);
  }

  @Query(() => SerialConnection)
  @Public()
  async getSerials(
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
  ): Promise<SerialConnection> {
    return this.serialsService.getSerials(
      { first, last, before, after },
      { title: query },
    );
  }

  @Mutation(() => Serial)
  async createSerial(
    @Args('createSerialData') createSerialData: CreateSerialInput,
  ): Promise<Serial> {
    return this.serialsService.createSerial(createSerialData);
  }

  @Mutation(() => Serial)
  async updateSerial(
    @Args('updateSerialData') updateSerialData: UpdateSerialInput,
  ): Promise<Serial> {
    return this.serialsService.updateSerial(updateSerialData);
  }

  @Mutation(() => Serial)
  async deleteSerial(@Args('id') id: string): Promise<Serial> {
    return this.serialsService.deleteSerial(id);
  }

  @ResolveField('episodes', () => EpisodeConnection)
  async getEpisodesBySerialId(
    @Parent() serial: Serial,
    @Args({
      name: 'first',
      type: () => Number,
      nullable: true,
    })
    first?: number,
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
  ): Promise<EpisodeConnection> {
    return this.episodesService.getEpisodes(
      { first, last, before, after },
      { serialId: serial.id },
    );
  }
}

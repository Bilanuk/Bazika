import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Serial } from './models/serial';
import { SerialsService } from './serials.service';
import { CreateSerialInput } from '@/serials/dto/inputs/create-serial';
import { UpdateSerialInput } from '@/serials/dto/inputs/update-serial';
import { GetSerialsArgs } from '@/serials/dto/args/get-serials';

@Resolver(() => Serial)
export class SerialsResolver {
  constructor(private readonly serialsService: SerialsService) {}

  @Query(() => Serial, { name: 'serial', nullable: false })
  async getSerial(@Args('id') id: number): Promise<Serial> {
    return this.serialsService.getSerial(id);
  }

  @Query(() => [Serial], { name: 'serials', nullable: 'itemsAndList' })
  async getSerials(@Args() getSerialsArgs: GetSerialsArgs): Promise<Serial[]> {
    return this.serialsService.getSerials(getSerialsArgs);
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
  async deleteSerial(@Args('id') id: number): Promise<Serial> {
    return this.serialsService.deleteSerial(id);
  }
}

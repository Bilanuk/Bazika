import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetEpisodeArgs {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  serialId?: string;
}

import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class DeleteEpisodeInput {
  @Field()
  @IsNotEmpty()
  id: number;
}

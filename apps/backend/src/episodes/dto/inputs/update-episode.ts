import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateEpisodeInput {
  @Field()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  url?: string;
}

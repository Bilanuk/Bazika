import { Field, InputType, Float } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateEpisodeInput {
  @Field()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field(() => String, { nullable: false })
  url: string;
}

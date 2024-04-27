import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateEpisodeInput {
  @Field() @IsNotEmpty() title: string;

  @Field() @IsNotEmpty() url: string;

  @Field() @IsNotEmpty() serialId: string;
}

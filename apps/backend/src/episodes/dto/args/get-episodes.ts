import { ArgsType, Field } from '@nestjs/graphql';
import { IsArray } from 'class-validator';

@ArgsType()
export class GetEpisodesArgs {
  @Field(() => [String], { nullable: true }) @IsArray() titles?: string[];

  @Field({ nullable: true }) skip?: number;

  @Field({ nullable: true }) take?: number;

  @Field({ defaultValue: 'id' }) orderBy?: string;
}

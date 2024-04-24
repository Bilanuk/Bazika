import { ArgsType, Field } from '@nestjs/graphql';
import { IsArray } from 'class-validator';

@ArgsType()
export class GetToiletsArgs {
  @Field(() => [String], { nullable: true })
  @IsArray()
  ids?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  streets?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  cities?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  countries?: string[];
}

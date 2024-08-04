import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateSerialInput {
  @Field() @IsNotEmpty() title: string;

  @Field() @IsNotEmpty() description: string;

  @Field(() => Float, { defaultValue: 0 }) @IsNotEmpty() rating: number;

  @Field() imageUrl?: string;
}

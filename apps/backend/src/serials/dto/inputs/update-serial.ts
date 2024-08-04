import { Field, InputType, Float } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateSerialInput {
  @Field() @IsNotEmpty() id: string;

  @Field({ nullable: true }) title?: string;

  @Field({ nullable: true }) description?: string;

  @Field(() => Float, { nullable: true }) rating?: number;

  @Field({ nullable: true }) imageUrl?: string;
}

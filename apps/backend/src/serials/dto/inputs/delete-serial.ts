import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class DeleteSerialInput {
  @Field()
  @IsNotEmpty()
  id: number;
}

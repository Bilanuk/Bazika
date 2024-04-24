import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ArgsType()
export class GetSerialArgs {
  @Field()
  @IsNotEmpty()
  id: string;
}

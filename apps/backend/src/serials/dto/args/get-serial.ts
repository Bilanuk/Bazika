import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetSerialArgs {
  @Field() id?: string;

  @Field() title?: string;
}

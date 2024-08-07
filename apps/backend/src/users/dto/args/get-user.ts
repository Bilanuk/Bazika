import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsEmail } from 'class-validator';

@ArgsType()
export class GetUserArgs {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  id?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;
}

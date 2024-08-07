import { Field, Float, ObjectType } from '@nestjs/graphql';
import { users as UserDB } from '@prisma/client';
import PaginatedResponse from '@/common/pagination/pagination';

@ObjectType()
export class User {
  @Field(() => String)
  id: UserDB['id'];

  @Field(() => String)
  name: UserDB['name'];

  @Field(() => String)
  email: UserDB['email'];

  @Field(() => Float)
  emailVerified: UserDB['emailVerified'];

  @Field(() => String)
  image: UserDB['image'];
}

@ObjectType()
export class SerialConnection extends PaginatedResponse(User) {}

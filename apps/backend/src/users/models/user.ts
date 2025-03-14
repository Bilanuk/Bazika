import { Field, Float, ObjectType } from '@nestjs/graphql';
import { User as UserDB } from '@database';
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

  @Field(() => String)
  role: UserDB['role'];
}

@ObjectType()
export class SerialConnection extends PaginatedResponse(User) {}

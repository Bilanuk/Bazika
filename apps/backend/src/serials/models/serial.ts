import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Serial as SerialDB } from '@database';
import PaginatedResponse from '@/common/pagination/pagination';

@ObjectType()
export class Serial {
  @Field(() => String)
  id: SerialDB['id'];

  @Field(() => String)
  title: SerialDB['title'];

  @Field(() => String)
  description: SerialDB['description'];

  @Field(() => Float)
  rating: SerialDB['rating'];

  @Field(() => String)
  imageUrl: SerialDB['imageUrl'];
}

@ObjectType()
export class SerialConnection extends PaginatedResponse(Serial) {}

import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Serial as SerialDB } from '@prisma/client';

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
}

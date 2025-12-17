import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Episode } from '@/episodes/models/episode';

@ObjectType()
export class Recommendation {
  @Field(() => Episode)
  episode: Episode;

  @Field(() => Float)
  score: number;
}




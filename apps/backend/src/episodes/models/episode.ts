import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Episode as EpisodeDB } from '@prisma/client';
import PaginatedResponse from '@/common/pagination/pagination';

@ObjectType()
export class Episode {
  @Field(() => String) id: EpisodeDB['id'];

  @Field(() => String) title: EpisodeDB['title'];

  @Field(() => String) url: EpisodeDB['url'];

  @Field(() => String) serialId: EpisodeDB['serialId'];

  @Field(() => String) createdAt: EpisodeDB['createdAt'];

  @Field(() => String) updatedAt: EpisodeDB['updatedAt'];

  @Field(() => Int) episodeNumber: EpisodeDB['episodeNumber'];
}

@ObjectType()
export class EpisodeConnection extends PaginatedResponse(Episode) {}

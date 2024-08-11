import { getClient } from '@/lib/client';
import EpisodeCard from '@components/EpisodeCard';
import { Episode } from '@/__generated__/graphql';
import { CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { GET_EPISODES } from '@/queries';
import { TypographyH4 } from '@components/ui/Typography';
import ClientSideCarousel from '@components/ClientSideCarousel';

export default async function GetRecentEpisodes() {
  const client = getClient();
  const { data, loading, errors } = await client.query({ query: GET_EPISODES });

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (errors) {
    return <h1>No episodes found</h1>;
  }

  return (
    <>
      <TypographyH4>Recent updates</TypographyH4>
      <ClientSideCarousel>
        <CarouselContent>
          {data.getEpisodes?.edges?.map((edge) => (
            <CarouselItem key={edge.node.id} className={'basis-1/5 pl-2'}>
              <EpisodeCard key={edge.node.id} episode={edge.node as Episode} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </ClientSideCarousel>
    </>
  );
}

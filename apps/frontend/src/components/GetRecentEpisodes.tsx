import { getClient } from '@/lib/client';
import EpisodeCard from '@components/EpisodeCard';
import { Episode } from '@/__generated__/graphql';
import { CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { GET_EPISODES } from '@/queries';
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
      <ClientSideCarousel>
        <CarouselContent>
          {data.getEpisodes?.edges?.map((edge) => (
            <CarouselItem
              key={edge.node.id}
              className={
                'xs:basis-1/2 pl-2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-60'
              }
            >
              <EpisodeCard key={edge.node.id} episode={edge.node as Episode} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </ClientSideCarousel>
    </>
  );
}

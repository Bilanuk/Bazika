import EpisodeCard from '@components/EpisodeCard';
import { Episode } from '@/__generated__/graphql';
import { CarouselContent, CarouselItem } from '@/components/ui/carousel';
import ClientSideCarousel from '@components/ClientSideCarousel';
import prisma from '@/lib/prisma';

export default async function GetRecentEpisodes() {
  const data = await prisma.episode.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      serial: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          rating: true,
        },
      },
    },
    take: 10,
  });

  return (
    <>
      <ClientSideCarousel>
        <CarouselContent>
          {data.map((edge) => (
            <CarouselItem
              key={edge.id}
              className={
                'pl-2 xs:basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-60'
              }
            >
              <EpisodeCard key={edge.id} episode={edge as unknown as Episode} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </ClientSideCarousel>
    </>
  );
}

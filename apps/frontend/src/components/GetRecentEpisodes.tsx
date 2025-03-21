import prisma from '@/lib/prisma';
import EpisodeCard from '@components/EpisodeCard';
import { CarouselContent, CarouselItem } from '@/components/ui/carousel';
import ClientSideCarousel from '@components/ClientSideCarousel';

export default async function GetRecentEpisodes() {
  const episodes = await prisma.episode.findMany({
    include: {
      serial: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });

  if (!episodes || episodes.length === 0) {
    return <h1>No episodes found</h1>;
  }

  return (
    <>
      <ClientSideCarousel>
        <CarouselContent>
          {episodes.map((episode) => (
            <CarouselItem
              key={episode.id}
              className={
                'pl-2 xs:basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-60'
              }
            >
              <EpisodeCard episode={episode} serial={episode.serial} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </ClientSideCarousel>
    </>
  );
}

import prisma from '@/lib/prisma';
import SerialCard from '@components/SerialCard';
import { CarouselContent, CarouselItem } from '@/components/ui/carousel';
import ClientSideCarousel from '@components/ClientSideCarousel';
import { unstable_cache } from 'next/cache';

const getRandomSerialsData = unstable_cache(
  async () => {
    // Get total count of serials
    const totalCount = await prisma.serial.count();

    if (totalCount === 0) return [];

    // Generate random skip values to get random serials
    const randomSerials = [];
    const serialsToFetch = Math.min(20, totalCount);

    for (let i = 0; i < serialsToFetch; i++) {
      const randomSkip = Math.floor(Math.random() * totalCount);
      const serial = await prisma.serial.findFirst({
        skip: randomSkip,
      });
      if (serial && !randomSerials.find((s) => s.id === serial.id)) {
        randomSerials.push(serial);
      }
    }

    return randomSerials;
  },
  ['random-serials'],
  { revalidate: 3600 } // Cache for 1 hour since it's random
);

export default async function GetRandomSerials() {
  const serials = await getRandomSerialsData();

  if (!serials || serials.length === 0) {
    return <h1>No serials found</h1>;
  }

  return (
    <>
      <ClientSideCarousel>
        <CarouselContent>
          {serials.map((serial) => (
            <CarouselItem
              key={serial.id}
              className={
                'pl-2 xs:basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-60'
              }
            >
              <SerialCard serial={serial} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </ClientSideCarousel>
    </>
  );
}

import { getSimilarSerials } from '@/lib/recommendations';
import ClientSideCarousel from '@/components/ClientSideCarousel';
import {
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export async function SimilarSerialsCarousel({ serialId }: { serialId: string }) {
  const serials = await getSimilarSerials(serialId);

  if (!serials || serials.length === 0) return null;

  return (
    <div className="col-span-4 w-full py-8">
      <h2 className="text-2xl font-bold mb-4 px-4">Similar</h2>
      <div className="w-full max-w-[95vw] mx-auto px-4">
        <ClientSideCarousel>
          <CarouselContent>
            {serials.map((serial) => (
              <CarouselItem
                key={serial.id}
                className="basis-1/2 md:basis-1/4 lg:basis-1/6"
              >
                <Link href={`/serial/${serial.id}`}>
                  <Card className="border-0 bg-transparent hover:scale-105 transition-transform cursor-pointer">
                    <CardContent className="p-0 aspect-[2/3] relative overflow-hidden rounded-lg">
                      <Image
                        src={serial.coverImage || '/placeholder.png'}
                        alt={serial.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8 text-white">
                        <div className="font-bold truncate text-sm">
                          {serial.title}
                        </div>
                        <div className="text-green-400 text-xs font-medium">
                          {serial.matchPercentage}% Match
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </ClientSideCarousel>
      </div>
    </div>
  );
}

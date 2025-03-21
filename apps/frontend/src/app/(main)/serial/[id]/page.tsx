import PageWrapper from '@components/PageWrapper';
import { TypographyH2, TypographyH4 } from '@components/ui/Typography';
import VideoPlayer from '@/components/VideoPlayer';
import Head from 'next/head';
import Image from 'next/image';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import prisma from '@/lib/prisma';

interface Props {
  params: { id: string };
  searchParams: { episode?: string };
}

export async function generateStaticParams() {
  const serials = await prisma.serial.findMany({
    select: { id: true },
  });

  return serials.map((serial) => ({
    id: serial.id,
  }));
}

export const dynamic = 'force-static';
export const revalidate = 10;

export default async function SerialPage({ params, searchParams }: Props) {
  const serial = await prisma.serial.findUnique({
    where: { id: params.id },
    include: {
      episodes: {
        orderBy: {
          episodeNumber: 'asc',
        },
      },
    },
  });

  if (!serial) {
    return <div>Serial not found</div>;
  }

  // Placeholder data
  const genres = ['Action', 'Comedy', 'Supernatural'];
  const viewCount = 12345;

  const serverTime = new Date().toISOString();

  return (
    <main className='col-span-4'>
      <Head>
        <title>{serial.title}</title>
      </Head>
      <PageWrapper>
        <div className='relative col-span-4 mb-8 grid grid-cols-4 gap-8 overflow-hidden rounded-xl bg-background/30 p-8 ring-1 ring-border/5 backdrop-blur-sm'>
          <div className='col-span-1'>
            <div className='relative aspect-[2/3] w-full'>
              <Image
                src={serial.imageUrl}
                alt={serial.title}
                fill
                className='rounded-lg object-cover shadow-lg'
              />
            </div>
          </div>
          <div className='col-span-3 space-y-4'>
            <div className='space-y-2'>
              <TypographyH2>{serial.title}</TypographyH2>
              <div className='flex items-center gap-4'>
                <Rating value={serial.rating} />
                <span className='text-muted-foreground'>
                  {serial.rating.toFixed(1)} / 5
                </span>
              </div>
            </div>

            <div className='flex gap-2'>
              {genres.map((genre) => (
                <Badge key={genre} variant='secondary'>
                  {genre}
                </Badge>
              ))}
            </div>

            <div className='flex items-center gap-2 text-muted-foreground'>
              <Eye className='h-4 w-4' />
              <span>{viewCount.toLocaleString()} views</span>
              <span>•</span>
              <span>{serial.episodes.length} episodes</span>
            </div>

            <div className='space-y-2'>
              <TypographyH4>Description</TypographyH4>
              <p className='leading-relaxed text-muted-foreground'>
                {serial.description}
              </p>
            </div>

            <div className='space-y-2'>
              <TypographyH4>{`Server time: ${serverTime}`}</TypographyH4>
            </div>
          </div>
        </div>

        <VideoPlayer
          episodes={serial.episodes.map((episode) => ({
            node: {
              ...episode,
              createdAt: episode.createdAt.toISOString(),
              updatedAt: episode.updatedAt.toISOString(),
              __typename: 'Episode',
            },
          }))}
          initialEpisodeNumber={searchParams.episode}
        />
      </PageWrapper>
    </main>
  );
}

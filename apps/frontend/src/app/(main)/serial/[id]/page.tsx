import PageWrapper from '@components/PageWrapper';
import { TypographyH2, TypographyH4 } from '@components/ui/Typography';
import VideoPlayer from '@/components/VideoPlayer';
import Head from 'next/head';
import Image from 'next/image';
import { getClient } from '@/lib/client';
import { GET_SERIAL } from '@/queries';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import PageSeparator from '@/components/PageSeparator';

interface Props {
  params: { id: string };
  searchParams: { episode?: string };
}

export default async function SerialPage({ params, searchParams }: Props) {
  const client = getClient();
  const { data } = await client.query({
    query: GET_SERIAL,
    variables: { id: params.id },
  });

  const { serial } = data;
  const { episodes } = serial;

  // Placeholder data
  const genres = ['Action', 'Comedy', 'Supernatural'];
  const viewCount = 12345;

  return (
    <main className='col-span-4'>
      <Head>
        <title>{serial.title}</title>
      </Head>
      <PageWrapper>
        <div className='relative col-span-4 mb-8 grid grid-cols-4 gap-8 overflow-hidden rounded-xl bg-background/50 p-8 ring-1 ring-border/5 backdrop-blur-sm before:absolute before:inset-0 before:-translate-y-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-background/10 before:to-transparent'>
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
            </div>

            <div className='space-y-2'>
              <TypographyH4>Description</TypographyH4>
              <p className='leading-relaxed text-muted-foreground'>
                {serial.description}
              </p>
            </div>

            <div className='space-y-2'>
              <TypographyH4>Episodes</TypographyH4>
              <p className='text-muted-foreground'>
                {episodes.edges?.length || 0} episodes available
              </p>
            </div>
          </div>
        </div>

        <VideoPlayer
          episodes={episodes.edges}
          initialEpisodeNumber={searchParams.episode}
        />
      </PageWrapper>
    </main>
  );
}

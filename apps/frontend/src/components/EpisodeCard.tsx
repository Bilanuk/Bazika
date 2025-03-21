import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Episode, Serial } from '@database';

interface SerialCardProps {
  episode: Episode;
  serial: Serial;
}

export default function EpisodeCard({ episode, serial }: SerialCardProps) {
  return (
    <Link
      href={{
        pathname: `/serial/${episode.serialId}`,
        query: { episode: episode.episodeNumber },
      }}
      className='block'
    >
      <Card className='ml-2 transition duration-300 ease-in-out hover:bg-secondary'>
        <CardHeader className='aspect-[3/4] p-3'>
          <Image
            src={serial.imageUrl}
            alt={serial.title}
            width={500}
            height={300}
            className='h-full w-full rounded-t-md object-cover'
          />
          <CardTitle className='truncate text-lg font-semibold'>
            {serial.title}
          </CardTitle>
          <div className='mt-2 flex justify-between text-sm text-gray-600'>
            <Badge>#{episode.episodeNumber}</Badge>
            <span>{serial.rating.toFixed(1)}/10</span>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Episode } from '@/__generated__/graphql';

interface SerialCardProps {
  episode: Episode;
}

export default function EpisodeCard({ episode }: SerialCardProps) {
  const { serial } = episode;

  return (
    <Link href={`/serial/${serial.id}`} passHref>
      <Card className='m-2 transition duration-300 ease-in-out hover:bg-secondary'>
        <CardHeader className='p-3'>
          <Image
            src={serial.imageUrl}
            alt={serial.title}
            width={300}
            height={200}
            className='h-48 w-full rounded-t-md object-cover'
          />
          <CardTitle className='truncate text-lg font-semibold'>
            {serial.title}
          </CardTitle>
          <div className='flex justify-between mt-2 text-sm text-gray-600'>
            <Badge>#{episode.episodeNumber}</Badge>
            <span>{serial.rating.toFixed(1)}/10</span>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

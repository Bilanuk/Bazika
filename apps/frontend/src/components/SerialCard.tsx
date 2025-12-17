import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@components/ui/card';
import { Serial } from '@database';
import { Rating } from '@/components/ui/Rating';
import { MdOutlineImageNotSupported } from "react-icons/md";

interface SerialCardProps {
  serial: Serial;
}

export default function SerialCard({ serial }: SerialCardProps) {
  return (
    <Link href={`/serial/${serial.id}`} className='block'>
      <Card className='ml-2 transition duration-300 ease-in-out hover:bg-secondary'>
        <CardHeader className='aspect-[3/4] p-3'>
          {serial.imageUrl ? (
            <Image
              src={serial.imageUrl}
              alt={serial.title}
              width={500}
              height={300}
              className='h-full w-full rounded-t-md object-cover'
            />
          ) : (
            <div className="h-full w-full rounded-t-md bg-muted flex items-center justify-center">
              <MdOutlineImageNotSupported className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <CardTitle className='truncate text-lg font-semibold'>
            {serial.title}
          </CardTitle>
          <div className='mt-2 flex items-center justify-between'>
            <Rating value={serial.rating} size="sm" />
            <span className='text-sm text-muted-foreground'>
              {serial.rating.toFixed(1)}/5
            </span>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
} 
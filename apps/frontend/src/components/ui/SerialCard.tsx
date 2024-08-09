'use client';

import { Serial } from '@/__generated__/graphql';
import Image from 'next/image';
import Link from 'next/link';

interface SerialCardProps {
  serial: Serial;
}

export default function SerialCard({ serial }: SerialCardProps) {
  return (
    <Link href={`/serial/${serial.id}`}>
      <div className='m-2 flex cursor-pointer flex-row justify-center rounded-md'>
        <div className='h-[340px] w-[240px] flex-shrink-0'>
          <Image
            src={serial.imageUrl}
            alt={serial.title}
            priority={true}
            width={240}
            height={340}
            blurDataURL={serial.imageUrl}
            className='rounded-md'
          />
        </div>

        <div className='m-2 flex flex-col gap-4 p-1'>
          <h2 className='font-semibold'>{serial.title}</h2>
          <p className='mt-2 text-sm'>
            {' '}
            {serial.description.length > 300
              ? serial.description.substring(0, 300) + '...'
              : serial.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

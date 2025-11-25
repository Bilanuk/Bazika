import PageWrapper from '@components/PageWrapper';
import { TypographyH2, TypographyH4 } from '@components/ui/Typography';
import VideoPlayer from '@/components/VideoPlayer';
import Head from 'next/head';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { notFound } from 'next/navigation';
import { MdOutlineImageNotSupported } from "react-icons/md";
import SerialAdminSheet from '@/components/SerialAdminSheet';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

interface Props {
  params: { id: string };
  searchParams: { episode?: string };
}

export const revalidate = 3600;

export default async function SerialPage({ params, searchParams }: Props) {
  const [serial, session] = await Promise.all([
    prisma.serial.findUnique({
      where: {
        id: params.id,
      },
      include: {
        episodes: {
          include: {
            videoAnalysis: true,
            contentItems: {
              include: {
                source: true,
              },
            },
          },
          orderBy: {
            episodeNumber: 'asc',
          },
        },
      },
    }),
    getServerSession(authOptions),
  ]);

  if (!serial) {
    notFound();
  }

  const viewCount = 12345; // Placeholder data
  const serverTime = new Date().toISOString();

  return (
    <main className='col-span-4'>
      <Head>
        <title>{serial.title}</title>
      </Head>
      
      {serial.bannerImage && (
        <div className='relative -mt-16 h-80 overflow-hidden'>
          <Image
            src={serial.bannerImage}
            alt={`${serial.title} banner`}
            fill
            className='object-cover'
            priority
          />
          {/* Gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background' />
        </div>
      )}
      
      <PageWrapper>
        <div className={`relative col-span-4 mb-8 grid grid-cols-4 gap-8 ${serial.bannerImage ? '-mt-24' : ''}`}>
          <div className='col-span-1'>
            <div className='relative aspect-[2/3] w-full'>
              {serial.imageUrl ? (
                <Image
                  src={serial.imageUrl}
                  alt={serial.title}
                  fill
                  className='rounded-lg object-cover shadow-lg'
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center shadow-lg">
                  <MdOutlineImageNotSupported className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
          <div className='col-span-3 space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <TypographyH2>{serial.title}</TypographyH2>
                <SerialAdminSheet serial={serial} user={session?.user} />
              </div>
              <div className='flex items-center gap-4'>
                <Rating value={serial.rating} />
                <span className='text-muted-foreground'>
                  {serial.rating.toFixed(1)} / 5
                </span>
              </div>
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
          episodes={serial.episodes}
          initialEpisodeNumber={searchParams.episode}
          isAdmin={session?.user?.role === 'ADMIN'}
        />
      </PageWrapper>
    </main>
  );
}

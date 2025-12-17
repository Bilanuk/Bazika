'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { MdOutlineImageNotSupported } from 'react-icons/md';
import { Episode, Serial } from '@database';
import { formatDistanceToNow } from 'date-fns';

interface EpisodeWithSerial extends Episode {
  serial: Serial;
}

interface RecentEpisodesVerticalProps {
  initialEpisodes: EpisodeWithSerial[];
  totalCount: number;
}

const EPISODES_PER_PAGE = 10;

export default function RecentEpisodesVertical({
  initialEpisodes,
  totalCount,
}: RecentEpisodesVerticalProps) {
  const [episodes, setEpisodes] = useState(initialEpisodes);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / EPISODES_PER_PAGE);

  const fetchEpisodes = async (page: number) => {
    setLoading(true);
    try {
      const skip = (page - 1) * EPISODES_PER_PAGE;
      const response = await fetch(
        `/api/episodes?skip=${skip}&take=${EPISODES_PER_PAGE}`
      );
      const data = await response.json();
      setEpisodes(data.episodes);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchEpisodes(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchEpisodes(currentPage + 1);
    }
  };

  return (
    <div className='space-y-4'>
      {/* Episodes List */}
      <div>
        {episodes.map((episode) => (
          <Link
            key={episode.id}
            href={{
              pathname: `/serial/${episode.serialId}`,
              query: { episode: episode.episodeNumber },
            }}
          >
            <Card className='mb-2 transition-all duration-200 hover:bg-secondary/50 hover:shadow-md'>
              <CardContent className='p-0'>
                <div className='flex gap-0'>
                  {/* Anime Image */}
                  <div className='relative h-36 w-28 flex-shrink-0 overflow-hidden rounded-l-lg'>
                    {episode.serial.imageUrl ? (
                      <Image
                        src={episode.serial.imageUrl}
                        alt={episode.serial.title}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center bg-muted'>
                        <MdOutlineImageNotSupported className='h-8 w-8 text-muted-foreground' />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className='flex-1 space-y-2 p-4'>
                    <div className='space-y-1'>
                      <h3 className='line-clamp-1 text-sm font-semibold leading-tight'>
                        {episode.serial.title}
                      </h3>
                      <Badge variant='secondary' className='text-xs'>
                        #{episode.episodeNumber}
                      </Badge>
                    </div>

                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Calendar className='h-3 w-3' />
                      <span>
                        {formatDistanceToNow(new Date(episode.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between pt-4'>
          <div className='text-sm text-muted-foreground'>
            Page {currentPage} of {totalPages} ({totalCount} episodes)
          </div>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePrevPage}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className='mr-1 h-4 w-4' />
              Previous
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
            >
              Next
              <ChevronRight className='ml-1 h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

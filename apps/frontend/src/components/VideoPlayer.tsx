'use client';

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { Episode } from '@/__generated__/graphql';
import { useState, useEffect, useRef } from 'react';
import { TypographyH3, TypographyP } from './ui/Typography';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  episodes:
    | Array<{
        __typename?: 'EpisodeEdge';
        node: {
          __typename?: 'Episode';
          id: string;
          title: string;
          url: string;
          episodeNumber: number;
          createdAt: string;
          updatedAt: string;
        };
      }>
    | null
    | undefined;
  initialEpisodeNumber?: string;
}

export default function VideoPlayer({ episodes, initialEpisodeNumber }: VideoPlayerProps) {
  const sortedEpisodes = episodes
    ?.slice()
    .sort((a, b) => a.node.episodeNumber - b.node.episodeNumber);

  const initialEpisode = initialEpisodeNumber
    ? sortedEpisodes?.find(
        (episode) => episode.node.episodeNumber === parseInt(initialEpisodeNumber)
      )?.node ?? sortedEpisodes?.[0]?.node
    : sortedEpisodes?.[0]?.node;

  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const episodeRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialEpisodeNumber) {
      const episodeNumber = parseInt(initialEpisodeNumber);
      if (isNaN(episodeNumber)) return;

      const episodeRef = episodeRefs.current[episodeNumber];
      if (episodeRef && scrollAreaRef.current) {
        const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollArea) {
          const episodeTop = episodeRef.offsetTop;
          const scrollAreaHeight = scrollArea.clientHeight;
          const scrollPosition = episodeTop - scrollAreaHeight / 2 + episodeRef.clientHeight / 2;
          
          scrollArea.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [initialEpisodeNumber]);

  if (!sortedEpisodes?.length || !currentEpisode) return null;

  return (
    <div className='grid grid-cols-4 col-span-4'>
      <div className='col-span-3'>
        <MediaPlayer
          title={currentEpisode.title}
          src={currentEpisode.url}
          aspectRatio='16/9'
        >
          <MediaProvider />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      </div>

      <div className='col-span-1'>
        <ScrollArea ref={scrollAreaRef} className='h-[600px] rounded-md border p-4'>
          <TypographyH3 className='mb-4'>Episodes</TypographyH3>
          <div className='flex flex-col gap-2'>
            {sortedEpisodes.map(({ node: episode }) => (
              <button
                key={episode.id}
                ref={el => {
                  if (el) episodeRefs.current[episode.episodeNumber] = el;
                }}
                onClick={() => setCurrentEpisode(episode)}
                className={cn(
                  'rounded-lg p-3 text-left transition-colors hover:bg-secondary',
                  currentEpisode.id === episode.id && 'bg-secondary'
                )}
              >
                <TypographyP>
                  {episode.episodeNumber} {episode.title}
                </TypographyP>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

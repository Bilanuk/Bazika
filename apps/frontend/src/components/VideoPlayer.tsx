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
import { AlertCircle } from 'lucide-react';

// Override Vidstack styles
const styles = `
  .vidstack-player {
    border: none !important;
    border-radius: 0 !important;
  }
  .vidstack-player .vds-media-player {
    border: none !important;
    border-radius: 0 !important;
  }
  .vidstack-player .vds-media-player .vds-media-container {
    border-radius: 0 !important;
  }
  .vidstack-player .vds-media-player .vds-media-container video {
    border-radius: 0 !important;
  }
`;

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

export default function VideoPlayer({
  episodes,
  initialEpisodeNumber,
}: VideoPlayerProps) {
  const sortedEpisodes = episodes
    ?.slice()
    .sort((a, b) => a.node.episodeNumber - b.node.episodeNumber);

  const initialEpisode = initialEpisodeNumber
    ? sortedEpisodes?.find(
        (episode) =>
          episode.node.episodeNumber === parseInt(initialEpisodeNumber)
      )?.node ?? sortedEpisodes?.[0]?.node
    : sortedEpisodes?.[0]?.node;

  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [isError, setIsError] = useState(false);
  const episodeRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialEpisodeNumber) {
      const episodeNumber = parseInt(initialEpisodeNumber);
      if (isNaN(episodeNumber)) return;

      const episodeRef = episodeRefs.current[episodeNumber];
      if (episodeRef && scrollAreaRef.current) {
        const scrollArea = scrollAreaRef.current.querySelector(
          '[data-radix-scroll-area-viewport]'
        );
        if (scrollArea) {
          const episodeTop = episodeRef.offsetTop;
          const scrollAreaHeight = scrollArea.clientHeight;
          const scrollPosition =
            episodeTop - scrollAreaHeight / 2 + episodeRef.clientHeight / 2;

          scrollArea.scrollTo({
            top: scrollPosition,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [initialEpisodeNumber]);

  if (!sortedEpisodes?.length || !currentEpisode) return null;

  return (
    <>
      <style>{styles}</style>
      <div className='col-span-4 grid grid-cols-4 rounded-lg border'>
        <div className='col-span-3'>
          {isError ? (
            <div className="flex h-[600px] flex-col items-center justify-center gap-4 bg-background/30 p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <TypographyH3>Video Unavailable</TypographyH3>
              <TypographyP className="text-muted-foreground">
                We apologize, but we are unable to load this video at the moment. Please try again later.
              </TypographyP>
            </div>
          ) : (
            <MediaPlayer
              title={currentEpisode.title}
              src={currentEpisode.url}
              aspectRatio='16/9'
              onError={() => setIsError(true)}
              className='h-[600px]'
            >
              <MediaProvider />
              <DefaultVideoLayout icons={defaultLayoutIcons} />
            </MediaPlayer>
          )}
        </div>

        <div className='col-span-1 border-l'>
          <ScrollArea
            ref={scrollAreaRef}
            className='h-[600px] p-4'
          >
            <TypographyH3 className='mb-4'>Episodes</TypographyH3>
            <div className='flex flex-col gap-2'>
              {sortedEpisodes.map(({ node: episode }) => (
                <button
                  key={episode.id}
                  ref={(el) => {
                    if (el) episodeRefs.current[episode.episodeNumber] = el;
                  }}
                  onClick={() => {
                    setCurrentEpisode(episode);
                    setIsError(false);
                  }}
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
    </>
  );
}

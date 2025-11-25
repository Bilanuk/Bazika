'use client';

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { Episode } from '@database';
import { useState, useEffect, useRef } from 'react';
import { TypographyH3, TypographyH4, TypographyP } from './ui/Typography';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { getVideoUrl } from '@/lib/video-utils';
import { useQuery } from '@apollo/client';
import { GET_RECOMMENDATIONS } from '@/queries/analysis';
import { Badge } from '@/components/ui/badge';
import { EpisodeContentItemsTable } from './EpisodeContentItemsTable';

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

type EpisodeWithAnalysis = Episode & {
  videoAnalysis?: {
    tags: string[];
    rating: string;
  } | null;
  contentItems?: Array<{
    id: string;
    title: string;
    quality: string | null;
    processingStatus: string;
    url: string;
    source: {
      name: string;
    };
  }>;
};

interface VideoPlayerProps {
  episodes: EpisodeWithAnalysis[] | null | undefined;
  initialEpisodeNumber?: string;
  isAdmin?: boolean;
}

export default function VideoPlayer({
  episodes,
  initialEpisodeNumber,
  isAdmin = false,
}: VideoPlayerProps) {
  const sortedEpisodes = episodes
    ?.slice()
    .sort((a, b) => a.episodeNumber - b.episodeNumber);

  const initialEpisode = initialEpisodeNumber
    ? sortedEpisodes?.find(
        (episode) => episode.episodeNumber.toString() === initialEpisodeNumber
      ) ?? sortedEpisodes?.[0]
    : sortedEpisodes?.[0];

  const [currentEpisode, setCurrentEpisode] = useState<EpisodeWithAnalysis | undefined>(initialEpisode);
  const [isError, setIsError] = useState(false);
  const episodeRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: recommendationsData } = useQuery(GET_RECOMMENDATIONS, {
    variables: { episodeId: currentEpisode?.id },
    skip: !currentEpisode?.id,
  });

  useEffect(() => {
    setCurrentEpisode(initialEpisode);
  }, [initialEpisode]);

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
            <div className='flex h-[600px] flex-col items-center justify-center gap-4 bg-background/30 p-8 text-center'>
              <AlertCircle className='h-12 w-12 text-destructive' />
              <TypographyH3>Video Unavailable</TypographyH3>
              <TypographyP className='text-muted-foreground'>
                We apologize, but we are unable to load this video at the
                moment. Please try again later.
              </TypographyP>
            </div>
          ) : (
            <MediaPlayer
              title={currentEpisode.title}
              src={getVideoUrl(currentEpisode.url)} // Constructs correct URL based on environment
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
          <ScrollArea ref={scrollAreaRef} className='h-[600px] p-4'>
            <TypographyH3 className='mb-4'>Episodes</TypographyH3>
            <div className='flex flex-col gap-2'>
              {sortedEpisodes.map((episode) => (
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
                    Episode {episode.episodeNumber}
                  </TypographyP>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className='mt-8 col-span-4 space-y-8'>
        {isAdmin && currentEpisode.contentItems && currentEpisode.contentItems.length > 0 && (
          <div>
            <TypographyH4 className='mb-4'>Content Items</TypographyH4>
            <EpisodeContentItemsTable 
              items={currentEpisode.contentItems}
              episodeId={currentEpisode.id}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {currentEpisode.videoAnalysis && (
          <div>
            <TypographyH4 className='mb-4'>AI Style Analysis</TypographyH4>
            <div className='flex flex-wrap gap-2'>
              {currentEpisode.videoAnalysis.tags.map((tag) => (
                <Badge key={tag} variant='secondary'>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {recommendationsData?.getRecommendations?.length > 0 && (
          <div>
            <TypographyH4 className='mb-4'>Visually Similar Episodes</TypographyH4>
            <div className='grid grid-cols-4 gap-4'>
              {recommendationsData.getRecommendations.map((rec: any) => (
                <div
                  key={rec.episode.id}
                  className='border rounded-lg p-4 space-y-2'
                >
                  <div className='flex justify-between items-center'>
                    <Badge variant={rec.score > 0.8 ? 'default' : 'outline'}>
                      Match: {(rec.score * 100).toFixed(0)}%
                    </Badge>
                    <span className='text-xs text-muted-foreground'>
                      Ep {rec.episode.episodeNumber}
                    </span>
                  </div>
                  <TypographyP className='font-medium line-clamp-2'>
                    {rec.episode.title || `Episode ${rec.episode.episodeNumber}`}
                  </TypographyP>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

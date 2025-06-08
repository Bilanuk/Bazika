import prisma from '@/lib/prisma';
import RecentEpisodesVertical from '@/components/RecentEpisodesVertical';
import { unstable_cache } from 'next/cache';

const getInitialEpisodesData = unstable_cache(
  async () => {
    const [episodes, totalCount] = await Promise.all([
      prisma.episode.findMany({
        include: {
          serial: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Initial load
      }),
      prisma.episode.count(),
    ]);

    return { episodes, totalCount };
  },
  ['initial-episodes-vertical'],
  { revalidate: 60 } // Cache for 1 minute
);

export default async function GetRecentEpisodesVertical() {
  const { episodes, totalCount } = await getInitialEpisodesData();

  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-muted-foreground">
          No episodes found
        </h3>
      </div>
    );
  }

  return (
    <RecentEpisodesVertical 
      initialEpisodes={episodes} 
      totalCount={totalCount} 
    />
  );
} 
import PageWrapper from '@components/PageWrapper';
import GetRecentEpisodes from '@components/GetRecentEpisodes';
import PageSeparator from '@components/PageSeparator';
import { TypographyH4 } from '@components/ui/Typography';
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-static';
export const revalidate = 10;

const getServerTimeStamp = unstable_cache(
  async () => new Date().toISOString(),
  ['server-timestamp'],
  { revalidate: 10 }
);

export default async function Home() {
  const serverTime = await getServerTimeStamp();
  console.log('Rendering page at:', serverTime);

  return (
    <main>
      <PageWrapper>
        <div className={'col-span-4'}>
          <TypographyH4>{`Recent updates - ${serverTime}`}</TypographyH4>
          <PageSeparator />
          <GetRecentEpisodes />
          <PageSeparator />
        </div>
      </PageWrapper>
    </main>
  );
}

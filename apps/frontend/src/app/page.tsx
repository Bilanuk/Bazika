import { AnimePlaceholder } from '@components/ui/AnimePlaceholder';
import PageWrapper from '@components/ui/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';
import GetRecentEpisodes from '@components/GetRecentEpisodes';
import { DEFAULT_REVALIDATE } from '@/common';

export const revalidate = 10;

export default function Home() {
  return (
    <main>
      <PageWrapper>
        <div className={'col-span-3'}>
          <TypographyH2>Recent updates</TypographyH2>
          <GetRecentEpisodes />
        </div>
        <div className={'col-span-1'}>
          <TypographyH2>Schedule</TypographyH2>
        </div>
      </PageWrapper>
    </main>
  );
}

import PageWrapper from '@components/PageWrapper';
import GetRecentEpisodes from '@components/GetRecentEpisodes';
import PageSeparator from '@components/PageSeparator';
import { TypographyH4 } from '@components/ui/Typography';

export const revalidate = 2;

export default function Home() {
  return (
    <main>
      <PageWrapper>
        <div className={'col-span-4'}>
          <TypographyH4>Recent updates</TypographyH4>
          <PageSeparator />
          <GetRecentEpisodes />
          <PageSeparator />
        </div>
      </PageWrapper>
    </main>
  );
}

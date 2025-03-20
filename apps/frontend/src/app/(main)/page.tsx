import PageWrapper from '@components/PageWrapper';
import GetRecentEpisodes from '@components/GetRecentEpisodes';
import PageSeparator from '@components/PageSeparator';
import { TypographyH4, TypographyP } from '@components/ui/Typography';

export const revalidate = 10;

export default function Home() {
  const serverTime = new Date().toISOString();

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

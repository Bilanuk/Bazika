import PageWrapper from '@components/ui/PageWrapper';
import GetRecentEpisodes from '@components/GetRecentEpisodes';

export const revalidate = 2;

export default function Home() {
  return (
    <main>
      <PageWrapper>
        <div className={'col-span-3'}>
          <GetRecentEpisodes />
        </div>
      </PageWrapper>
    </main>
  );
}

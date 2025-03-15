import PageWrapper from '@components/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';
import VideoPlayer from '@/components/VideoPlayer';
import Head from 'next/head';
import Image from 'next/image';
import { getClient } from '@/lib/client';
import { GET_SERIAL } from '@/queries';
import { Episode } from '@/__generated__/graphql';

interface Props {
  params: { id: string };
  searchParams: { episode?: string };
}

export default async function SerialPage({ params, searchParams }: Props) {
  const client = getClient();
  const { data } = await client.query({
    query: GET_SERIAL,
    variables: { id: params.id },
  });

  const { serial } = data;
  const { episodes } = serial;

  return (
    <main>
      <Head>
        <title>{serial.title}</title>
      </Head>
      <PageWrapper>
        <div className={'col-span-4'}>
          <div className={'grid grid-cols-4 gap-4'}>
            <div className={'col-span-1'}>
              <Image
                src={serial.imageUrl}
                alt={serial.title}
                width={200}
                height={300}
              />
            </div>
            <div className={'col-span-3'}>
              <TypographyH2>{serial.title}</TypographyH2>
              <p>{serial.description}</p>
            </div>
          </div>
        </div>
        <VideoPlayer episodes={episodes.edges} initialEpisodeNumber={searchParams.episode} />
      </PageWrapper>
    </main>
  );
}

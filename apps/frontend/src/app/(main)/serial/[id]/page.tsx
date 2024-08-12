import PageWrapper from '@components/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';
import VideoPlayer from '@components/VideoPlayer';
import Head from 'next/head';

import Image from 'next/image';
import { getClient } from '@/lib/client';
import { GET_SERIAL } from '@/queries';

export const revalidate = 2;

export default async function SerialPage({
  params,
}: {
  params: { id: string };
}) {
  const client = getClient();
  const { data, loading } = await client.query({
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
              <TypographyH2>{data.serial.title}</TypographyH2>
              <p>{data.serial.description}</p>
            </div>
          </div>
        </div>
        <div>
          <TypographyH2>Episodes</TypographyH2>
          {episodes.edges?.map((episode) => (
            <div key={episode.node.id}>
              <TypographyH2>{episode.node.title}</TypographyH2>
              <VideoPlayer url={episode.node.url} />
            </div>
          ))}
        </div>
      </PageWrapper>
    </main>
  );
}

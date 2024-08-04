import { gql } from '@/__generated__';
import { getClient } from '@/lib/client';
import SerialCard from '@components/ui/SerialCard';
import { Serial } from '@/__generated__/graphql';

export const dynamic = 'force-dynamic';

const GET_EPISODES = gql(/* GraphQL */ `
  query GetEpisodes {
    getEpisodes(first: 10) {
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
      edges {
        node {
          id
          title
          url
          createdAt
          updatedAt
          serial {
            id
            title
            imageUrl
            description
            rating
          }
        }
      }
    }
  }
`);

export default async function GetRecentEpisodes() {
  const client = getClient();
  const { data, loading } = await client.query({ query: GET_EPISODES });

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      {data.getEpisodes?.edges?.map((edge) => (
        <SerialCard
          key={edge.node.id}
          serial={edge.node.serial as Serial}
        />
      ))}
    </>
  );
}

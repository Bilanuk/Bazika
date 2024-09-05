import { gql } from '@/__generated__';

export const GET_EPISODES = gql(/* GraphQL */ `
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
          episodeNumber
          serialId
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

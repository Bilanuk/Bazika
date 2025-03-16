import { gql } from '@/__generated__';

export const GET_SERIAL = gql(/* GraphQL */ `
  query GetSerial($id: String!) {
    serial(id: $id) {
      id
      title
      imageUrl
      description
      rating
      episodes {
        edges {
          node {
            id
            title
            url
            episodeNumber
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`);

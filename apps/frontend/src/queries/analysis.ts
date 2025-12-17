import { gql } from '@apollo/client';

export const GET_RECOMMENDATIONS = gql`
  query GetRecommendations($episodeId: String!) {
    getRecommendations(episodeId: $episodeId) {
      score
      episode {
        id
        title
        episodeNumber
        url
        serialId
        createdAt
        updatedAt
      }
    }
  }
`;




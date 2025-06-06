/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query GetEpisodes {\n    getEpisodes(first: 25) {\n      pageInfo {\n        endCursor\n        startCursor\n        hasNextPage\n        hasPreviousPage\n      }\n      totalCount\n      edges {\n        node {\n          id\n          title\n          url\n          createdAt\n          updatedAt\n          episodeNumber\n          serialId\n          serial {\n            id\n            title\n            imageUrl\n            description\n            rating\n          }\n        }\n      }\n    }\n  }\n": types.GetEpisodesDocument,
    "\n  query GetSerial($id: String!) {\n    serial(id: $id) {\n      id\n      title\n      imageUrl\n      description\n      rating\n      episodes {\n        edges {\n          node {\n            id\n            title\n            url\n            episodeNumber\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  }\n": types.GetSerialDocument,
    "\n  query GetUser {\n    user {\n      id\n      name\n      email\n      emailVerified\n      image\n      role\n    }\n  }\n": types.GetUserDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetEpisodes {\n    getEpisodes(first: 25) {\n      pageInfo {\n        endCursor\n        startCursor\n        hasNextPage\n        hasPreviousPage\n      }\n      totalCount\n      edges {\n        node {\n          id\n          title\n          url\n          createdAt\n          updatedAt\n          episodeNumber\n          serialId\n          serial {\n            id\n            title\n            imageUrl\n            description\n            rating\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetEpisodes {\n    getEpisodes(first: 25) {\n      pageInfo {\n        endCursor\n        startCursor\n        hasNextPage\n        hasPreviousPage\n      }\n      totalCount\n      edges {\n        node {\n          id\n          title\n          url\n          createdAt\n          updatedAt\n          episodeNumber\n          serialId\n          serial {\n            id\n            title\n            imageUrl\n            description\n            rating\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetSerial($id: String!) {\n    serial(id: $id) {\n      id\n      title\n      imageUrl\n      description\n      rating\n      episodes {\n        edges {\n          node {\n            id\n            title\n            url\n            episodeNumber\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetSerial($id: String!) {\n    serial(id: $id) {\n      id\n      title\n      imageUrl\n      description\n      rating\n      episodes {\n        edges {\n          node {\n            id\n            title\n            url\n            episodeNumber\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUser {\n    user {\n      id\n      name\n      email\n      emailVerified\n      image\n      role\n    }\n  }\n"): (typeof documents)["\n  query GetUser {\n    user {\n      id\n      name\n      email\n      emailVerified\n      image\n      role\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CreateEpisodeInput = {
  serialId: Scalars['String']['input'];
  title: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type CreateSerialInput = {
  description: Scalars['String']['input'];
  imageUrl: Scalars['String']['input'];
  rating?: Scalars['Float']['input'];
  title: Scalars['String']['input'];
};

export type Episode = {
  __typename?: 'Episode';
  createdAt: Scalars['String']['output'];
  episodeNumber: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  serial: Serial;
  serialId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type EpisodeConnection = {
  __typename?: 'EpisodeConnection';
  edges?: Maybe<Array<EpisodeEdge>>;
  nodes?: Maybe<Array<Episode>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EpisodeEdge = {
  __typename?: 'EpisodeEdge';
  cursor: Scalars['String']['output'];
  node: Episode;
};

export type Mutation = {
  __typename?: 'Mutation';
  createEpisode: Episode;
  createSerial: Serial;
  deleteEpisode: Episode;
  deleteSerial: Serial;
  updateEpisode: Episode;
  updateSerial: Serial;
};


export type MutationCreateEpisodeArgs = {
  createEpisodeData: CreateEpisodeInput;
};


export type MutationCreateSerialArgs = {
  createSerialData: CreateSerialInput;
};


export type MutationDeleteEpisodeArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteSerialArgs = {
  id: Scalars['String']['input'];
};


export type MutationUpdateEpisodeArgs = {
  updateEpisodeData: UpdateEpisodeInput;
};


export type MutationUpdateSerialArgs = {
  updateSerialData: UpdateSerialInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  episode: Episode;
  getEpisodes: EpisodeConnection;
  getSerials: SerialConnection;
  serial: Serial;
  user: User;
};


export type QueryEpisodeArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  serialId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetEpisodesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Float']['input']>;
  last?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetSerialsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Float']['input']>;
  last?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySerialArgs = {
  id: Scalars['String']['input'];
};

export type Serial = {
  __typename?: 'Serial';
  description: Scalars['String']['output'];
  episodes: EpisodeConnection;
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  rating: Scalars['Float']['output'];
  title: Scalars['String']['output'];
};


export type SerialEpisodesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Float']['input']>;
  last?: InputMaybe<Scalars['Float']['input']>;
};

export type SerialConnection = {
  __typename?: 'SerialConnection';
  edges?: Maybe<Array<SerialEdge>>;
  nodes?: Maybe<Array<Serial>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SerialEdge = {
  __typename?: 'SerialEdge';
  cursor: Scalars['String']['output'];
  node: Serial;
};

export type UpdateEpisodeInput = {
  id: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSerialInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  emailVerified?: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  role: Scalars['String']['output'];
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node: User;
};

export type GetEpisodesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEpisodesQuery = { __typename?: 'Query', getEpisodes: { __typename?: 'EpisodeConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, startCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean }, edges?: Array<{ __typename?: 'EpisodeEdge', node: { __typename?: 'Episode', id: string, title: string, url: string, createdAt: string, updatedAt: string, episodeNumber: number, serialId: string, serial: { __typename?: 'Serial', id: string, title: string, imageUrl: string, description: string, rating: number } } }> | null } };

export type GetSerialQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetSerialQuery = { __typename?: 'Query', serial: { __typename?: 'Serial', id: string, title: string, imageUrl: string, description: string, episodes: { __typename?: 'EpisodeConnection', edges?: Array<{ __typename?: 'EpisodeEdge', node: { __typename?: 'Episode', id: string, title: string, url: string, createdAt: string, updatedAt: string } }> | null } } };

export type GetUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, name: string, email: string, emailVerified?: number | null, image?: string | null, role: string } };


export const GetEpisodesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEpisodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getEpisodes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"25"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"episodeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"serialId"}},{"kind":"Field","name":{"kind":"Name","value":"serial"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetEpisodesQuery, GetEpisodesQueryVariables>;
export const GetSerialDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSerial"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serial"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"episodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetSerialQuery, GetSerialQueryVariables>;
export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
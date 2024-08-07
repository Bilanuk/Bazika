import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";
import { setContext } from '@apollo/client/link/context';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/authOptions';

const authLink = setContext(async (_, { headers }) => {
  const session = await getServerSession(authOptions);
  const token = session?.auth_token;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

export const { getClient } = registerApolloClient(() => {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL,
  });

  return new ApolloClient({
    uri: process.env.NEXT_PUBLIC_API_URL,
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
});

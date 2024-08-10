import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { Adapter } from 'next-auth/adapters';
import { signJwt } from '@/lib/jwt';
import { authorize } from '@app/api/auth/[...nextauth]/authorize';

export const adapter = SupabaseAdapter({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  secret: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
}) as Adapter;

export const authOptions: AuthOptions = {
  secret: process.env.APP_JWT_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: {
        timeout: 10000,
      },
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      id: 'googleonetap',
      name: 'google-one-tap',
      credentials: {
        credential: { type: 'text' },
      },
      authorize,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  adapter,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.auth_token = await signJwt({
          sub: token.sub,
          id_token: account.id_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
        });
      }
      return token;
    },
    async session({ session, token }) {
      session.auth_token = token.auth_token as string;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/auth/error'
  }
};

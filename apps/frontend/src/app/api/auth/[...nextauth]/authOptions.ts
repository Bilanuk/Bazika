import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { signJwt } from '@/lib/jwt';
import type { Adapter } from 'next-auth/adapters';
import { authorize } from '@app/api/auth/[...nextauth]/authorize';
import prisma from '@/lib/prisma';

export const adapter = PrismaAdapter(prisma) as Adapter;

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
    maxAge: 24 * 60 * 60, // 1 day
  },
  adapter,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.auth_token = await signJwt(
          {
            sub: token.sub,
            id_token: account.id_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
          },
          '1d'
        );
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
    error: '/auth/error',
  },
};

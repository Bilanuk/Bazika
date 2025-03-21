import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { signJwt } from '@/lib/jwt';
import type { Adapter } from 'next-auth/adapters';
import { authorize } from '@app/api/auth/[...nextauth]/authorize';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const adapter = PrismaAdapter(prisma) as Adapter;

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            accounts: {
              where: {
                provider: 'credentials',
              },
            },
          },
        });

        if (!user || !user.accounts.length) {
          throw new Error('No account found with these credentials');
        }

        const passwordAccount = user.accounts[0];
        const isCorrectPassword = await compare(
          credentials.password,
          passwordAccount.access_token || ''
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
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

        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        token.role = user?.role;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        auth_token: token.auth_token as string,
        user: {
          ...session.user,
          role: token.role,
        },
      };
    },
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/auth/error',
    newUser: '/',
  },
};

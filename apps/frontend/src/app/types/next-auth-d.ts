import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name: string;
      email: string;
      image: string;
    }
    auth_token: string;
    expires_at: string;
  }
}

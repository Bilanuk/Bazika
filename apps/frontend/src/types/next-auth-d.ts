/* eslint-disable */
import NextAuth from 'next-auth';
import { UserRoles } from '@/types';
declare module 'next-auth' {
  interface Session {
    user: {
      name: string;
      email: string;
      image: string;
      role: UserRoles;
    };
    auth_token: string;
    expires_at: string;
  }
}

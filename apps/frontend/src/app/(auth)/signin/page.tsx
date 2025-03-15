import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/authOptions';
import GoogleSignInButton from '@components/GoogleSignInButton';
import CredentialsSignInForm from '@components/CredentialsSignInForm';
import React from 'react';
import Logo from '@components/Logo';
import { TypographyP, TypographySmall } from '@/components/ui/Typography';
import Link from 'next/link';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/');
  }

  return (
    <div className='flex h-screen w-1/2 min-w-[250px] max-w-[350px] items-center justify-center px-0 sm:px-2 lg:px-2'>
      <div className='w-full max-w-xl space-y-10 px-4'>
        <div className='text-center'>
          <Logo />
        </div>
        <CredentialsSignInForm />
        <div className='space-y-4'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='bg-background px-1 text-muted-foreground'>
                Or continue with
              </span>
            </div>
          </div>
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}

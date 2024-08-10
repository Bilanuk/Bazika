import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/authOptions';
import GoogleSignInButton from '@components/GoogleSignInButton';
import React from 'react';
import Logo from '@components/Logo';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/');
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div className={'flex h-full flex-col'}>
        <div className={'mt-8 text-center'}>
          <Logo />
        </div>
        <div className={'flex h-full flex-col items-center justify-center'}>
          <div style={{ textAlign: 'center' }}>
            <GoogleSignInButton />
          </div>
        </div>
      </div>
    </div>
  );
}

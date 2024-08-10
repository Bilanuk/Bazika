import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/authOptions';
import GoogleSignInButton from '@components/GoogleSignInButton';
import React from 'react';

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
      <div style={{ textAlign: 'center' }}>
        <GoogleSignInButton />
      </div>
    </div>
  );
}

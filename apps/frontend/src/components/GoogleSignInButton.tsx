'use client';
import { signIn } from 'next-auth/react';
import React from 'react';
import { Button } from '@components/ui/button';

const GoogleSignInButton = () => {
  return <Button onClick={() => signIn('google')}>Sign in with Google</Button>;
};

export default GoogleSignInButton;

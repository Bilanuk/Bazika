'use client';
import { signIn } from 'next-auth/react';
import React from 'react';
import { Button } from '@components/ui/button';

const SignInButton = () => {
  return <Button onClick={() => signIn()}>Sign in</Button>;
};

export default SignInButton;

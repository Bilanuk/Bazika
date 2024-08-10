'use client';
import { signIn } from 'next-auth/react';
import React from 'react';
import { Button } from '@components/ui/button';
import Image from 'next/image';

const ButtonContent = () => {
  return (
    <>
      <span className={'m-3'}>Sign in with</span>
      <Image src={'/google-logo.svg'} alt={'G'} width={20} height={20} />
    </>
  );
};

const GoogleSignInButton = () => {
  return (
    <Button onClick={() => signIn('google')}>
      <ButtonContent />
    </Button>
  );
};

export default GoogleSignInButton;

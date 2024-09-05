'use client';
import React from 'react';
import { Button } from '@components/ui/button';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const SignInButton = () => {
  const handleClick = () => {
    redirect('/signin');
  };

  return (
    <Link href={'/signin'}>
      <Button>Sign in</Button>
    </Link>
  );
};

export default SignInButton;

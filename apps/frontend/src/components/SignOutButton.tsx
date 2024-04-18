'use client';
import { signOut } from 'next-auth/react';
import React from 'react';

const SignOutButton = () => {
  return (
    <button
      onClick={() => signOut()}
      className='text-sm tracking-tight text-sky-400 dark:text-sky-300'
    >
      Sign out
    </button>
  );
};

export default SignOutButton;

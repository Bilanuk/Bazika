'use client';
import { signOut } from 'next-auth/react';
import React from 'react';

const LogOutButton = ({ children }: { children: string }) => {
  return <span onClick={() => signOut()}>{children}</span>;
};

export default LogOutButton;

import { getServerSession } from 'next-auth';
import SignOutButton from '@components/SignOutButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SignInButton from '@components/SignInButton';
import { UserDropdown } from '@components/UserDropdown';
import React from 'react';

export default async function UserMenu() {
  const session = await getServerSession();

  if (session) {
    return <UserDropdown />;
  }

  return <SignInButton />;
}

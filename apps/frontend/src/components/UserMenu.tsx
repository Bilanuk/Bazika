'use client';

import { useSession } from 'next-auth/react';
import SignInButton from '@components/SignInButton';
import { UserDropdown } from '@components/UserDropdown';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const UserMenu = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex cursor-pointer flex-row items-center space-x-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  if (session) {
    return <UserDropdown />;
  }

  return <SignInButton />;
}

export default dynamic(() => Promise.resolve(UserMenu), {
  ssr: false
});

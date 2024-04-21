'use client';

import { signOut } from 'next-auth/react';
import React from 'react';
import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from '@components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';

const LogOutButton = () => {
  return (
    <DropdownMenuItem onClick={() => signOut()}>
      <LogOut className='mr-2 h-4 w-4' />
      <span>Sign out</span>
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
  );
};

export default LogOutButton;

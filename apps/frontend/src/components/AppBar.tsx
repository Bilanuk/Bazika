import React from 'react';
import UserMenu from './UserMenu';
import ThemeSwitch from '@/components/ThemeSwitch';
import Logo from '@components/Logo';

const Appbar = () => {
  return (
    <header className='bg:white sticky top-0 z-50 flex w-full justify-between gap-4 border-b border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex w-full justify-between gap-4'>
        <Logo />
        <div className='flex gap-4'>
          <ThemeSwitch />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Appbar;

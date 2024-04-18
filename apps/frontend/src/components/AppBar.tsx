import React from 'react';
import UserMenu from './UserMenu';
import ThemeSwitch from '@/components/ThemeSwitch';
import { LogoTypography } from '@components/ui/Typography';

const Appbar = () => {
  return (
    <header className='bg:white border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex w-full justify-between gap-4 border-b p-2 pl-2 pr-2 backdrop-blur md:pl-12 md:pr-12'>
      <LogoTypography>Bazika</LogoTypography>
      <div className='flex gap-4'>
        <ThemeSwitch />
        <UserMenu />
      </div>
    </header>
  );
};

export default Appbar;

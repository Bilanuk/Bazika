import LayoutHalfPageImage from '@components/LayoutHalfPageImage';
import Logo from '@components/Logo';
import React from 'react';

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='flex min-h-screen'>
      <div className='min-h-screen w-1/2'>
        <LayoutHalfPageImage />
      </div>
      <div className='flex w-1/2 flex-col items-center justify-center'>
        <div className={'mt-8'}>
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}

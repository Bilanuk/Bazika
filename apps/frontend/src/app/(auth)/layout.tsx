import LayoutHalfPageImage from '@components/LayoutHalfPageImage';
import React from 'react';

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='flex'>
      <div className='w-1/2'>
        <LayoutHalfPageImage />
      </div>
      <div className='flex w-1/2 flex-col items-center justify-center'>
        {children}
      </div>
    </div>
  );
}

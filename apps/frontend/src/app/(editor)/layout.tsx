import * as React from 'react';

import DashboardWrapper from '@components/dashboard/DashboardWrapper';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='bg-white text-black dark:bg-black dark:text-white'>
      <div className='min-h-screen dark:bg-black/[.9]'>
        <DashboardWrapper>{children}</DashboardWrapper>
      </div>
    </div>
  );
}

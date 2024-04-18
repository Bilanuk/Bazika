import { ReactNode } from 'react';

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className='h-full w-full flex-col p-4'>
      <div
        className={
          'grid grid-cols-1 md:grid-cols-4 gap-3 p-4 container'
        }
      >
        {children}
      </div>
    </div>
  );
}

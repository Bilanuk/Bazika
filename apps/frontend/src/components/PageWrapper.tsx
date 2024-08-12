import { ReactNode } from 'react';

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className='h-full w-full flex-col md:px-4'>
      <div className={'container grid grid-cols-1 gap-5 p-4 md:grid-cols-4'}>
        {children}
      </div>
    </div>
  );
}

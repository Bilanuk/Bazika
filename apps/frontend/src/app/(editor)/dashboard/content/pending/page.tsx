import { Suspense } from 'react';
import { PendingItemsTable } from '@/components/PendingItemsTable';

export default function PendingItemsPage() {
  return (
    <div className='container mx-auto py-10'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Pending Content Items</h1>
        <p className='text-muted-foreground mt-2'>
          Content items that need to be matched to a serial
        </p>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <PendingItemsTable />
      </Suspense>
    </div>
  );
}




import { Skeleton } from '@/components/ui/skeleton';

export function AnimePlaceholder() {
  return (
    <div className='mt-4 flex flex-row gap-4'>
      <Skeleton className='h-[250px] w-[200px]' />
      <div className='flex flex-col gap-4 p-2'>
        <Skeleton className='h-[20px] w-[300px]' />
        <Skeleton className='h-[20px] w-[150px]' />
      </div>
    </div>
  );
}

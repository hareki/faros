import { Skeleton } from '@/src/components/ui/Skeleton';

export function ApplicationDetailSkeleton() {
  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* Title bar: company name + role */}
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-7 w-48' />
        <Skeleton className='h-5 w-72' />
      </div>

      <div className='flex gap-8'>
        {/* Field blocks (left column) */}
        <div className='flex flex-1 flex-col gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='flex flex-col gap-1.5'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-9 w-full' />
            </div>
          ))}
        </div>

        {/* Timeline column (right column) */}
        <div className='flex w-56 shrink-0 flex-col gap-3'>
          <Skeleton className='h-4 w-20' />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-start gap-2'>
              <Skeleton className='mt-1 size-2 shrink-0 rounded-full' />
              <div className='flex flex-1 flex-col gap-1'>
                <Skeleton className='h-3.5 w-full' />
                <Skeleton className='h-3 w-20' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

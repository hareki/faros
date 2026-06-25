'use client';

import { type PropsWithChildren, ViewTransition } from 'react';

import { usePathname } from 'next/navigation';

export function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <ViewTransition key={pathname} enter='page' exit='page' default='none'>
      <div className='scroll-layer'>{children}</div>
    </ViewTransition>
  );
}

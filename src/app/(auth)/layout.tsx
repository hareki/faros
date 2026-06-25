import { type PropsWithChildren } from 'react';

import { requireGuest } from '@/src/lib/better-auth/session';

export default async function AuthLayout({ children }: PropsWithChildren) {
  await requireGuest();

  return (
    <div className='flex-center size-screen'>
      <main className='relative flex w-full justify-center px-4'>{children}</main>
    </div>
  );
}

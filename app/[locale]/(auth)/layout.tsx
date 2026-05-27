import { type PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className='flex-center size-screen'>
      <main className='flex w-full justify-center px-4'>{children}</main>
    </div>
  );
}

import { type PropsWithChildren } from 'react';

import { NextIntlClientProvider, useMessages } from 'next-intl';

export default function AuthLayout({ children }: PropsWithChildren) {
  const messages = useMessages().AuthClient;

  return (
    <div className='flex-center size-screen'>
      <main className='flex w-full justify-center px-4'>
        <NextIntlClientProvider messages={{ AuthClient: messages }}>
          {children}
        </NextIntlClientProvider>
      </main>
    </div>
  );
}

import { type PropsWithChildren } from 'react';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

type GlobalClientProviderProps = PropsWithChildren;

export default async function GlobalClientProvider({ children }: GlobalClientProviderProps) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      messages={{
        GlobalValidation: messages.GlobalValidation,
        GlobalErrorBoundary: messages.GlobalErrorBoundary,
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}

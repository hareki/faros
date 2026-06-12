import { type PropsWithChildren } from 'react';

import { NextIntlClientProvider } from 'next-intl';

import { GLOBAL_CLIENT_NAMESPACES, pickNamespaces } from '../clientMessages';
import { getClientMessages } from '../getClientMessages';

type GlobalClientProviderProps = PropsWithChildren;

export default async function GlobalClientProvider({ children }: GlobalClientProviderProps) {
  const clientMessages = await getClientMessages();

  return (
    <NextIntlClientProvider messages={pickNamespaces(clientMessages, GLOBAL_CLIENT_NAMESPACES)}>
      {children}
    </NextIntlClientProvider>
  );
}

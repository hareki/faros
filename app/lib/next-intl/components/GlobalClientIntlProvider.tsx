import { type PropsWithChildren } from 'react';

import { NextIntlClientProvider } from 'next-intl';

import { GLOBAL_CLIENT_NAMESPACES, pickNamespaces } from '../utils/clientMessages';
import { getClientMessages } from '../utils/getClientMessages';

type GlobalClientProviderProps = PropsWithChildren;

export async function GlobalClientIntlProvider({ children }: GlobalClientProviderProps) {
  const clientMessages = await getClientMessages();
  const globalClientMessages = pickNamespaces(clientMessages, GLOBAL_CLIENT_NAMESPACES);

  return (
    <NextIntlClientProvider messages={globalClientMessages}>{children}</NextIntlClientProvider>
  );
}

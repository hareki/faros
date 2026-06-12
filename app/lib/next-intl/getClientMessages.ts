import { getLocale } from 'next-intl/server';

import { type ClientMessages } from './clientMessages';

/**
 * Loads the client-exposed message tree for the active locale.
 * Server components use it to build typed message props for client components,
 * keeping `server.json` content out of the client payload by construction.
 *
 * Lives apart from `clientMessages.ts` so client components can import the
 * `ClientMessages` type without pulling in `next-intl/server`.
 */
export async function getClientMessages(): Promise<ClientMessages> {
  const locale = await getLocale();

  return (await import(`./messages/${locale}/client.json`)).default;
}

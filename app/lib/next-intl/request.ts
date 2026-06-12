import { getRequestConfig } from 'next-intl/server';

import { getUserLocale } from './locale';
import { mergeMessages } from './mergeMessages';

const requestConfig = getRequestConfig(async () => {
  const locale = await getUserLocale();
  const [client, server] = await Promise.all([
    import(`./messages/${locale}/client.json`),
    import(`./messages/${locale}/server.json`),
  ]);

  return {
    locale,
    messages: mergeMessages(client.default, server.default),
  };
});

export default requestConfig;

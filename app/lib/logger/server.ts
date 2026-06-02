import 'server-only';

import { serverEnv } from '@/app/lib/t3-env/server';

import { createLogger } from './createLogger';

export const logger = createLogger({
  runtime: 'server',
  pretty: serverEnv.STAGE === 'development',
});

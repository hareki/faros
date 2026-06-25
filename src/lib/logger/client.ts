'use client';

import { createLogger } from './createLogger';
import { clientEnv } from '../t3-env/client';

export const clientLogger = createLogger({
  runtime: 'client',
  pretty: clientEnv.NEXT_PUBLIC_STAGE === 'development',
});

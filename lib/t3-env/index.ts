import './load-env';

import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const env = createEnv({
  server: {
    SHARED_ENV: z.string().min(1),
    DB_CONNECTION_STRING: z.url(),
  },
  experimental__runtimeEnv: {},
});

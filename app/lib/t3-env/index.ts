import './load-env';

import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const env = createEnv({
  server: {
    DB_CONNECTION_STRING: z.url(),
    RESEND_API_KEY: z.string(),
  },
  experimental__runtimeEnv: {},
});

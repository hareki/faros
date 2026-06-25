import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_STAGE: z.enum(['development', 'production']),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE,
  },
});

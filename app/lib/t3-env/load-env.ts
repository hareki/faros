import path from 'node:path';

import { loadEnvConfig } from '@next/env';

// Dotenv files live in `env/` instead of the project root, so Next.js never
// auto-loads them. Re-run Next's own loader pointed at that directory.
const envDir = path.join(process.cwd(), 'env');
const isDev = process.env.NODE_ENV !== 'production';

// forceReload bypasses Next's __NEXT_PROCESSED_ENV guard from the (empty) root load.
loadEnvConfig(envDir, isDev, undefined, true);

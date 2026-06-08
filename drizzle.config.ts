import './app/lib/t3-env/load-env';

import { defineConfig } from 'drizzle-kit';

// Relative import (not the @/ alias) so drizzle-kit's config loader can resolve it.
import { serverEnv } from './app/lib/t3-env/server';

export default defineConfig({
  dialect: 'postgresql',
  schema: './app/db/schema',
  out: './app/db/migrations',
  dbCredentials: { url: serverEnv.DB_CONNECTION_STRING },
});

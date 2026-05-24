import { defineConfig } from 'drizzle-kit';

// Relative import (not the @/ alias) so drizzle-kit's config loader can resolve it.
import { env } from './app/lib/t3-env';

export default defineConfig({
  dialect: 'postgresql',
  schema: './app/db/schema',
  out: './app/db/migrations',
  dbCredentials: { url: env.DB_CONNECTION_STRING },
});

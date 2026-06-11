import { remember } from '@epic-web/remember';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from '@/app/db/schema';
import { serverEnv } from '@/app/lib/t3-env/server';

// Avoid creating new connection in development, no harm in production either
const pool = remember(
  'db-pool',
  () => new Pool({ connectionString: serverEnv.DB_CONNECTION_STRING }),
);

export const db = drizzle(pool, { schema });

/**
 * The `db` singleton or a transaction handle from `db.transaction(...)`. Helpers that
 * write activity rows take this so a mutation can compose the state change and its
 * activity log entry in one transaction (ADR-0002).
 */
export type DbExecutor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

import { remember } from '@epic-web/remember';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from '@/app/db/schema';
import { env } from '@/app/lib/t3-env';

// Avoid creating new connection in development, no harm in production either
const pool = remember('db-pool', () => new Pool({ connectionString: env.DB_CONNECTION_STRING }));

export const db = drizzle(pool, { schema });

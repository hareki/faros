'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { setFavorite } from '@/src/features/application/db/mutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

/**
 * Sets an application's `favorite` flag to the given target value (idempotent, not a blind flip)
 * for an application the current user owns. A missing or foreign id yields
 * `errorApplicationNotFound`. No activity-log write (ADR-0007).
 */
export const toggleFavoriteAction = createServerAction({
  schema: () => z.object({ id: z.uuid(), favorite: z.boolean() }),
  handler: async ({ id, favorite }): Promise<ApplicationActionResult> => {
    const user = await requireUser();

    const updated = await setFavorite(db, { userId: user.id, id, favorite });

    if (!updated) {
      return { status: 'error', errorKey: 'errorApplicationNotFound' };
    }

    return { status: 'success' };
  },
});

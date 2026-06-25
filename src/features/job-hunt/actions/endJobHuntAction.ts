'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { endJobHunt } from '@/src/features/job-hunt/db/mutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type JobHuntActionResult } from './types';

/**
 * Ends the current user's active hunt, making it read-only and unlocking its Retro. A
 * missing/foreign/already-ended id yields `errorJobHuntNotFound`.
 */
export const endJobHuntAction = createServerAction({
  schema: () => z.object({ id: z.uuid() }),
  handler: async ({ id }): Promise<JobHuntActionResult> => {
    const user = await requireUser();

    const ended = await endJobHunt(db, { userId: user.id, id });

    if (!ended) {
      return { status: 'error', errorKey: 'errorJobHuntNotFound' };
    }

    return { status: 'success' };
  },
});

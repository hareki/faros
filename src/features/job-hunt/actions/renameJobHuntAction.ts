'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { renameJobHunt } from '@/src/features/job-hunt/db/mutations';
import { buildJobHuntNameSchema } from '@/src/features/job-hunt/schemas/jobHuntName';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type JobHuntActionResult } from './types';

/** Renames a hunt the current user owns; a missing/foreign id yields `errorJobHuntNotFound`. */
export const renameJobHuntAction = createServerAction({
  schema: () => buildJobHuntNameSchema().extend({ id: z.uuid() }),
  handler: async ({ id, name }): Promise<JobHuntActionResult> => {
    const user = await requireUser();

    const updated = await renameJobHunt(db, { userId: user.id, id, name });

    if (!updated) {
      return { status: 'error', errorKey: 'errorJobHuntNotFound' };
    }

    return { status: 'success' };
  },
});

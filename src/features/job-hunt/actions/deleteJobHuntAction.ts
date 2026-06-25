'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { deleteJobHunt } from '@/src/features/job-hunt/db/mutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type JobHuntActionResult } from './types';

/**
 * Permanently deletes one of the user's ended hunts and everything in it (applications and
 * their tags cascade via FK). The `status = 'ended'` guard in the mutation means the live
 * active hunt can never be deleted; a non-match yields `errorCannotDeleteActiveJobHunt`. The
 * selection lives in the `?job_hunt` URL param, so the caller just navigates away from the
 * deleted hunt and the resolver falls back.
 */
export const deleteJobHuntAction = createServerAction({
  schema: () => z.object({ id: z.uuid() }),
  handler: async ({ id }): Promise<JobHuntActionResult> => {
    const user = await requireUser();

    const deleted = await deleteJobHunt(db, { userId: user.id, id });

    if (!deleted) {
      return { status: 'error', errorKey: 'errorCannotDeleteActiveJobHunt' };
    }

    return { status: 'success' };
  },
});

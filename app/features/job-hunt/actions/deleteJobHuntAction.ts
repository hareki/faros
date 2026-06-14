'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

import { db } from '@/app/db/client';
import { deleteJobHunt } from '@/app/features/job-hunt/db/mutations';
import { SELECTED_JOB_HUNT_COOKIE } from '@/app/features/job-hunt/server/selectedJobHunt';
import { requireUser } from '@/app/lib/better-auth/session';
import { createServerAction } from '@/app/lib/next/createServerAction';

import { type JobHuntActionResult } from './types';

/**
 * Permanently deletes one of the user's ended hunts and everything in it (applications and
 * their tags cascade via FK). The `status = 'ended'` guard in the mutation means the live
 * active hunt can never be deleted; a non-match yields `errorCannotDeleteActiveJobHunt`. The
 * selection cookie is cleared when it pointed at the deleted hunt so the resolver falls back.
 */
export const deleteJobHuntAction = createServerAction({
  schema: () => z.object({ id: z.uuid() }),
  handler: async ({ id }): Promise<JobHuntActionResult> => {
    const user = await requireUser();

    const deleted = await deleteJobHunt(db, { userId: user.id, id });

    if (!deleted) {
      return { status: 'error', errorKey: 'errorCannotDeleteActiveJobHunt' };
    }

    const cookieStore = await cookies();

    if (cookieStore.get(SELECTED_JOB_HUNT_COOKIE)?.value === id) {
      cookieStore.delete(SELECTED_JOB_HUNT_COOKIE);
    }

    return { status: 'success' };
  },
});

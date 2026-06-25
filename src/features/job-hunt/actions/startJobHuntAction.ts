'use server';

import { db } from '@/src/db/client';
import { startJobHunt } from '@/src/features/job-hunt/db/mutations';
import { buildJobHuntNameSchema } from '@/src/features/job-hunt/schemas/jobHuntName';
import { requireUser } from '@/src/lib/better-auth/session';
import { isUniqueViolation } from '@/src/lib/drizzle/errors';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type JobHuntActionResult } from './types';

/**
 * Starts a new active hunt for the current user. The "one active hunt per user" rule is
 * enforced by the `one_active_job_hunt_per_user` partial unique index; a conflicting insert
 * is caught and surfaced as a friendly `errorActiveJobHuntExists` result.
 */
export const startJobHuntAction = createServerAction({
  schema: buildJobHuntNameSchema,
  handler: async ({ name }): Promise<JobHuntActionResult> => {
    const user = await requireUser();

    try {
      await startJobHunt(db, { userId: user.id, name });
    } catch (error) {
      if (isUniqueViolation(error, 'one_active_job_hunt_per_user')) {
        return { status: 'error', errorKey: 'errorActiveJobHuntExists' };
      }

      // Unknown failure — let the wrapper log it and return errorGeneric.
      throw error;
    }

    return { status: 'success' };
  },
});

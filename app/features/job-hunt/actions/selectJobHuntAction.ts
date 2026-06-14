'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

import { SELECTED_JOB_HUNT_COOKIE } from '@/app/features/job-hunt/server/selectedJobHunt';
import { requireUser } from '@/app/lib/better-auth/session';
import { createServerAction } from '@/app/lib/next/createServerAction';

import { type JobHuntActionResult } from './types';

/**
 * Records which hunt the user is viewing in the `faros.selected_job_hunt` cookie. The id is
 * not verified against the user's hunts here — the resolver only ever returns a hunt from the
 * caller's own list, so a stale or foreign id simply falls back on the next load.
 */
export const selectJobHuntAction = createServerAction({
  schema: () => z.object({ id: z.uuid() }),
  handler: async ({ id }): Promise<JobHuntActionResult> => {
    await requireUser();

    (await cookies()).set(SELECTED_JOB_HUNT_COOKIE, id, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return { status: 'success' };
  },
});

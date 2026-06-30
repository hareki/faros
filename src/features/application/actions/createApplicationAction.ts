'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { createApplication } from '@/src/features/application/db/mutations';
import {
  applicationSource,
  boardStage,
  closedOutcome,
  workingModel,
} from '@/src/features/application/db/schema';
import { getActiveJobHunt } from '@/src/features/job-hunt/db/queries';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

/**
 * Creates an application in the current user's active hunt. The hunt is resolved server-side
 * (never trusted from the client) since quick-add only exists on the active board. A `closed`
 * stage requires a `closedOutcome`; backfill of implied milestones is `createApplication`'s job
 * (ADR-0006). Yields `errorNoActiveJobHunt` when the user has no active hunt.
 */
// fallow-ignore-next-line unused-export
export const createApplicationAction = createServerAction({
  schema: () =>
    z
      .object({
        company: z.string().trim().min(1).max(200),
        role: z.string().trim().min(1).max(200),
        stage: z.enum(boardStage.enumValues),
        source: z.enum(applicationSource.enumValues).nullish(),
        jdUrl: z.url().nullish(),
        jdText: z.string().nullish(),
        location: z.string().max(200).nullish(),
        workingModel: z.enum(workingModel.enumValues).nullish(),
        salaryMin: z.number().positive().nullish(),
        salaryMax: z.number().positive().nullish(),
        salaryCurrency: z.string().max(8).nullish(),
        notes: z.string().nullish(),
        closedOutcome: z.enum(closedOutcome.enumValues).nullish(),
      })
      .refine((value) => value.stage !== 'closed' || value.closedOutcome != null, {
        path: ['closedOutcome'],
      }),
  handler: async (data): Promise<ApplicationActionResult> => {
    const user = await requireUser();
    const activeHunt = await getActiveJobHunt(db, user.id);

    if (!activeHunt) {
      return { status: 'error', errorKey: 'errorNoActiveJobHunt' };
    }

    await db.transaction((tx) => createApplication(tx, { jobHuntId: activeHunt.id, ...data }));

    return { status: 'success' };
  },
});

'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { updateApplication } from '@/src/features/application/db/mutations';
import { applicationSource, workingModel } from '@/src/features/application/db/schema';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

/**
 * Owner-scoped update of an application's editable metadata (including Lexical notes). A
 * missing or foreign id yields `errorApplicationNotFound`. The empty => non-empty notes
 * transition logs `note_added` inside `updateApplication`.
 */
export const updateApplicationAction = createServerAction({
  schema: () =>
    z.object({
      id: z.uuid(),
      company: z.string().trim().min(1).max(200).optional(),
      role: z.string().trim().min(1).max(200).optional(),
      source: z.enum(applicationSource.enumValues).nullish(),
      jdUrl: z.url().nullish(),
      jdText: z.string().nullish(),
      location: z.string().max(200).nullish(),
      workingModel: z.enum(workingModel.enumValues).nullish(),
      salaryMin: z.number().positive().nullish(),
      salaryMax: z.number().positive().nullish(),
      salaryCurrency: z.string().max(8).nullish(),
      notes: z.string().nullish(),
    }),
  handler: async ({ id, ...data }): Promise<ApplicationActionResult> => {
    const user = await requireUser();

    const updated = await db.transaction((tx) =>
      updateApplication(tx, { userId: user.id, id, data }),
    );

    if (!updated) {
      return { status: 'error', errorKey: 'errorApplicationNotFound' };
    }

    return { status: 'success' };
  },
});

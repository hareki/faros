'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { moveStage } from '@/src/features/application/db/mutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

// Closing is its own action (closeApplicationAction) because it needs an outcome; moveStage
// only handles the non-closed columns.
const MOVABLE_STAGES = ['applied', 'active', 'final_stages'] as const;

/**
 * Moves an owned application to a non-closed stage (or re-opens it from Closed). A missing or
 * foreign id yields `errorApplicationNotFound`. Dropping into Closed is rejected at the schema
 * (use `closeApplicationAction`).
 */
// fallow-ignore-next-line unused-export
export const moveStageAction = createServerAction({
  schema: () => z.object({ id: z.uuid(), to: z.enum(MOVABLE_STAGES) }),
  handler: async ({ id, to }): Promise<ApplicationActionResult> => {
    const user = await requireUser();

    const updated = await db.transaction((tx) => moveStage(tx, { userId: user.id, id, to }));

    if (!updated) {
      return { status: 'error', errorKey: 'errorApplicationNotFound' };
    }

    return { status: 'success' };
  },
});

'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { reorderSubStages } from '@/src/features/application/db/subStageMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type SubStageActionResult } from './types';

const SUB_STAGE_STAGES = ['active', 'final_stages'] as const;

/** Persists a drag-reordered sub-stage list (Settings). Always succeeds for owned ids. */
export const reorderSubStagesAction = createServerAction({
  schema: () => z.object({ stage: z.enum(SUB_STAGE_STAGES), orderedIds: z.array(z.uuid()) }),
  handler: async ({ stage, orderedIds }): Promise<SubStageActionResult> => {
    const user = await requireUser();

    await db.transaction((tx) => reorderSubStages(tx, { userId: user.id, stage, orderedIds }));

    return { status: 'success' };
  },
});

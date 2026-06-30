'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { updateTag } from '@/src/features/application/db/tagMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { isUniqueViolation } from '@/src/lib/drizzle/errors';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type TagActionResult } from './types';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Updates an owned tag's name and color. Missing => `errorTagNotFound`; dup => `errorTagNameTaken`. */
export const updateTagAction = createServerAction({
  schema: () =>
    z.object({
      id: z.uuid(),
      name: z.string().trim().min(1).max(50),
      color: z.string().regex(HEX_COLOR).nullish(),
    }),
  handler: async ({ id, name, color }): Promise<TagActionResult> => {
    const user = await requireUser();

    try {
      const updated = await updateTag(db, { userId: user.id, id, name, color: color ?? null });

      if (!updated) {
        return { status: 'error', errorKey: 'errorTagNotFound' };
      }
    } catch (error) {
      if (isUniqueViolation(error, 'tags_user_name_unique')) {
        return { status: 'error', errorKey: 'errorTagNameTaken' };
      }

      throw error;
    }

    return { status: 'success' };
  },
});

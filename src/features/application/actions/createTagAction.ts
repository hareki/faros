'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { createTag } from '@/src/features/application/db/tagMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { isUniqueViolation } from '@/src/lib/drizzle/errors';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type TagActionResult } from './types';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Creates a user tag. A duplicate name yields `errorTagNameTaken`. */
export const createTagAction = createServerAction({
  schema: () =>
    z.object({
      name: z.string().trim().min(1).max(50),
      color: z.string().regex(HEX_COLOR).nullish(),
    }),
  handler: async ({ name, color }): Promise<TagActionResult> => {
    const user = await requireUser();

    try {
      await createTag(db, { userId: user.id, name, color: color ?? null });
    } catch (error) {
      if (isUniqueViolation(error, 'tags_user_name_unique')) {
        return { status: 'error', errorKey: 'errorTagNameTaken' };
      }

      throw error;
    }

    return { status: 'success' };
  },
});

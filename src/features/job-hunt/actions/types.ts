import { type Messages } from 'next-intl';

import { type ActionResult } from '@/src/types/common';

export type JobHuntErrorKey = keyof Messages['layout']['jobHuntDialogs']['errors'];

export type JobHuntActionResult = ActionResult<JobHuntErrorKey>;

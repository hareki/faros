import { type Messages } from 'next-intl';

import { type ActionResult } from '@/app/types/common';

export type JobHuntErrorKey = keyof Messages['layout']['jobHuntDialogs']['errors'];

export type JobHuntActionResult = ActionResult<JobHuntErrorKey>;

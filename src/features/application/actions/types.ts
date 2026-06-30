import { type ActionResult } from '@/src/types/common';

/** Feature-specific error keys an application action can return (on top of the global keys). */
export type ApplicationErrorKey =
  | 'errorApplicationNotFound'
  | 'errorNoActiveJobHunt'
  | 'errorSubStageInvalid'
  | 'errorTagInvalid';

export type ApplicationActionResult = ActionResult<ApplicationErrorKey>;

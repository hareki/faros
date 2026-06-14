import { type Messages } from 'next-intl';

import { type ActionResult } from '@/app/types/common';

export type AuthErrorKey = keyof Messages['auth']['shared']['errors'];

export type AuthActionResult = ActionResult<AuthErrorKey>;
export type SignInResult = AuthActionResult | { status: 'needs-verification' };

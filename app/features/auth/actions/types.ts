import { type Messages } from 'next-intl';

import { type ActionResult } from '@/app/types/common';

export type AuthErrorKey = Extract<
  keyof Messages['ClientAuthentication'],
  'errorInvalidCredentials' | 'errorInvalidToken'
>;

export type AuthActionResult = ActionResult<AuthErrorKey>;
export type SignInResult = AuthActionResult | { status: 'needs-verification' };

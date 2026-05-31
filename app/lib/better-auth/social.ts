import { type SocialProvider as SocialProviderPrimitive } from 'better-auth';

import { authClient } from '@/app/lib/better-auth/client';
import { type NextRoute } from '@/app/types/common';

export type SupportedSocialProvider = Extract<SocialProviderPrimitive, 'google' | 'github'>;

export async function socialSignIn(provider: SupportedSocialProvider) {
  const { error } = await authClient.signIn.social({
    provider,
    callbackURL: '/' satisfies NextRoute,
  });

  // On success authClient redirects the browser to the provider; we only
  // land here when the request failed before the redirect.
  if (error) {
    throw new Error(error.message);
  }
}

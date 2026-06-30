import { headers } from 'next/headers';
import { vi } from 'vitest';

import { auth } from '@/src/lib/better-auth';

/**
 * Signs in via auth.api and exposes the session cookie to headers() so requireUser()
 * resolves to this user for the dynamically-imported action under test.
 */
export async function signInAs(email: string, password: string): Promise<void> {
  const { headers: responseHeaders } = await auth.api.signInEmail({
    body: { email, password },
    headers: new Headers(),
    returnHeaders: true,
  });
  const cookie = responseHeaders
    .getSetCookie()
    .map((entry: string) => entry.split(';')[0])
    .join('; ');
  const requestHeaders = new Headers();

  requestHeaders.set('cookie', cookie);
  vi.mocked(headers).mockResolvedValue(requestHeaders);
}

import { headers } from 'next/headers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { auth } from '@/src/lib/better-auth';
import { createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

// redirect() normally throws a Next control-flow signal; here it throws a
// recognizable sentinel so we can assert the target path.
class RedirectError extends Error {
  constructor(public url: string) {
    super(`REDIRECT:${url}`);
  }
}

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new RedirectError(url);
  }),
}));

// getSession is wrapped in React cache(); reset modules per test so each test
// gets a fresh, un-memoized session read.
beforeEach(() => {
  vi.resetModules();
});

function loadGuards() {
  return import('@/src/lib/better-auth/session');
}

// Sign in via auth.api and turn the Set-Cookie response into a Cookie request
// header, so getSession sees an authenticated request.
async function signedInHeaders(email: string) {
  const { headers: responseHeaders } = await auth.api.signInEmail({
    body: { email, password: PASSWORD },
    headers: new Headers(),
    returnHeaders: true,
  });
  const cookie = responseHeaders
    .getSetCookie()
    .map((entry) => entry.split(';')[0])
    .join('; ');

  const requestHeaders = new Headers();

  requestHeaders.set('cookie', cookie);

  return requestHeaders;
}

describe('route guards', () => {
  describe('without a session', () => {
    it('requireUser redirects unauthenticated users to /sign-in', async () => {
      const { requireUser } = await loadGuards();

      await expect(requireUser()).rejects.toThrow('REDIRECT:/sign-in');
    });

    it('requireGuest lets unauthenticated users through', async () => {
      const { requireGuest } = await loadGuards();

      await expect(requireGuest()).resolves.toBeUndefined();
    });
  });

  describe('with a session', () => {
    it('requireUser returns the authenticated user', async () => {
      const email = 'guard-user@example.com';

      await createVerifiedUser({ email, password: PASSWORD });
      vi.mocked(headers).mockResolvedValue(await signedInHeaders(email));

      const { requireUser } = await loadGuards();
      const user = await requireUser();

      expect(user.email).toBe(email);
    });

    it('requireGuest redirects authenticated users to /dashboard', async () => {
      const email = 'guard-guest@example.com';

      await createVerifiedUser({ email, password: PASSWORD });
      vi.mocked(headers).mockResolvedValue(await signedInHeaders(email));

      const { requireGuest } = await loadGuards();

      await expect(requireGuest()).rejects.toThrow('REDIRECT:/dashboard');
    });
  });
});

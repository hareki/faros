import '@/app/lib/t3-env/load-env';

import { neonConfig } from '@neondatabase/serverless';
import { vi, beforeEach } from 'vitest';
import ws from 'ws';

import { resetSentEmails } from './helpers/email';

// The neon serverless driver needs a WebSocket implementation in Node.
neonConfig.webSocketConstructor = ws;

// Safety: every test truncates the whole database. Refuse to run unless we are
// pointed at the dedicated "test" Neon branch, so we can never wipe dev/prod.
const TEST_DB_HOST = 'ep-soft-fire';

if (!process.env.DB_CONNECTION_STRING?.includes(TEST_DB_HOST)) {
  throw new Error(
    `Refusing to run: DB_CONNECTION_STRING is not the "${TEST_DB_HOST}" test branch. ` +
      'Check env/.env.test.',
  );
}

// Replace the auth email boundary with capturing fakes — no Resend, no next-intl,
// no @faros/emails rendering. better-auth calls these with the token URL.
vi.mock('@/app/features/auth/utils/email', async () => {
  const { sentEmails } = await import('./helpers/email');

  return {
    sendVerificationEmail: vi.fn(({ to, url }: { to: string; url: string }) => {
      sentEmails.push({ type: 'verify', to, url });
    }),
    sendResetPasswordEmail: vi.fn(({ to, url }: { to: string; url: string }) => {
      sentEmails.push({ type: 'reset', to, url });
    }),
    sendExistingAccountEmail: vi.fn(({ to }: { to: string }) => {
      sentEmails.push({ type: 'existing', to });
    }),
  };
});

// In-memory headers + cookie store so server actions (headers()) and the
// nextCookies() plugin (cookies().set) work without a real request context.
const cookieStore = new Map<string, string>();

// headers() is a vi.fn so individual tests (e.g. route guards) can override it
// with a request carrying a session cookie. Defaults to empty headers.
const { headersMock } = vi.hoisted(() => ({
  headersMock: vi.fn(() => new Headers()),
}));

vi.mock('next/headers', () => ({
  headers: headersMock,
  cookies: () => ({
    get: (name: string) =>
      cookieStore.has(name) ? { name, value: cookieStore.get(name) } : undefined,
    getAll: () => [...cookieStore].map(([name, value]) => ({ name, value })),
    has: (name: string) => cookieStore.has(name),
    set: (name: string | { name: string; value: string }, value?: string) => {
      if (typeof name === 'object') {
        cookieStore.set(name.name, name.value);
      } else {
        cookieStore.set(name, value ?? '');
      }
    },
    delete: (name: string) => cookieStore.delete(name),
  }),
}));

// Import lazily (after env + ws are configured) to avoid creating the Pool early.
beforeEach(async () => {
  const { truncateAll } = await import('./helpers/db');

  await truncateAll();
  cookieStore.clear();
  resetSentEmails();
  vi.clearAllMocks();
  // Restore the default (no request context) after clearing call history.
  headersMock.mockImplementation(() => new Headers());
});

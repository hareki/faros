// Capture store for the mocked auth email boundary (see src/lib/vitest/setup.ts).
// better-auth hands the verification/reset URL to the functions in
// src/features/auth/utils/email.tsx; the mock records them here so tests can
// assert which email fired and extract tokens.
export type SentEmailType = 'verify' | 'reset' | 'existing';

export type SentEmail = {
  type: SentEmailType;
  to: string;
  url?: string;
};

export const sentEmails: SentEmail[] = [];

export function resetSentEmails() {
  sentEmails.length = 0;
}

export function emailsOfType(type: SentEmailType) {
  return sentEmails.filter((email) => email.type === type);
}

// Extracts the reset/verification token from a captured URL. Better Auth puts
// it as the last path segment (e.g. /api/auth/reset-password/<token>?callbackURL=…),
// falling back to a `?token=` query param.
export function tokenFromUrl(url: string) {
  const parsed = new URL(url);
  const fromQuery = parsed.searchParams.get('token');

  if (fromQuery) {
    return fromQuery;
  }

  const segments = parsed.pathname.split('/').filter(Boolean);

  return segments.at(-1) ?? null;
}

// Token from the most recently captured email of the given type. Throws if no
// such email was captured or it carries no token, so callers get a plain string.
export function tokenForEmail(type: SentEmailType) {
  const email = sentEmails.findLast((entry) => entry.type === type);
  const token = email?.url ? tokenFromUrl(email.url) : null;

  if (!token) {
    throw new Error(`No ${type} email with a token was captured`);
  }

  return token;
}

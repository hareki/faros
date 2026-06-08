import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/app/db/client';
import { accounts, users } from '@/app/db/schema';
import { signInAction } from '@/app/features/auth/actions/signInAction';
import { signUpAction } from '@/app/features/auth/actions/signUpAction';

import { createVerifiedUser } from '../helpers/db';
import { emailsOfType } from '../helpers/email';

const PASSWORD = 'Sup3r$ecret!'; // >=10 chars + a special char (passes zPassword)

describe('sign-up', () => {
  it('creates an unverified user with a credential account and sends a verification email', async () => {
    const email = 'newuser@example.com';

    const result = await signUpAction({ email, password: PASSWORD });

    expect(result).toEqual({ status: 'success' });

    const [user] = await db.select().from(users).where(eq(users.email, email));

    expect(user).toBeDefined();
    expect(user.emailVerified).toBe(false);

    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, user.id));

    expect(userAccounts).toHaveLength(1);
    expect(userAccounts[0].providerId).toBe('credential');

    expect(emailsOfType('verify')).toHaveLength(1);
    expect(emailsOfType('existing')).toHaveLength(0);
  });

  it('blocks sign-in until the email is verified', async () => {
    const email = 'unverified@example.com';

    await signUpAction({ email, password: PASSWORD });

    const result = await signInAction({ email, password: PASSWORD });

    expect(result).toEqual({ status: 'needs-verification' });
  });

  it('protects against email enumeration when the email already exists', async () => {
    const email = 'existing@example.com';

    await createVerifiedUser({ email, password: PASSWORD });

    const result = await signUpAction({ email, password: PASSWORD });

    expect(result).toEqual({ status: 'success' });

    // No second user row for the same email.
    const rows = await db.select().from(users).where(eq(users.email, email));

    expect(rows).toHaveLength(1);

    // The existing-account email fires instead of a new verification email.
    expect(emailsOfType('existing')).toHaveLength(1);
    expect(emailsOfType('verify')).toHaveLength(0);
  });
});

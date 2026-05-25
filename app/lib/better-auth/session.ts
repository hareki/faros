import { cache } from 'react';

import { headers } from 'next/headers';
import { getLocale } from 'next-intl/server';

import { auth } from '@/app/lib/better-auth';
import { redirect } from '@/app/lib/next-intl/navigation';

// Multiple calls within a  single request/render dedupe to one read
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function getUser() {
  const session = await getSession();

  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getUser();

  if (!user) {
    const locale = await getLocale();

    redirect({ href: '/sign-in', locale });
  }

  return user;
}

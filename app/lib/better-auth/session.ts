import { cache } from 'react';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/app/lib/better-auth';

// Multiple calls within a  single request/render dedupe to one read
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function getUser() {
  const session = await getSession();

  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return user;
}

export async function requireGuest() {
  const user = await getUser();

  if (user) {
    redirect('/dashboard');
  }
}

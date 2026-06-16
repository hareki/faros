import { redirect } from 'next/navigation';

import { getUser } from '@/app/lib/better-auth/session';

export default async function LandingPage() {
  const user = await getUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/sign-in');
  }
}

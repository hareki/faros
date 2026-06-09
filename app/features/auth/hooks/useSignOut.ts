import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { authClient } from '@/app/lib/better-auth/client';

export function useSignOut() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function signOut() {
    startTransition(async () => {
      await authClient.signOut();
      router.push('/sign-in');
      router.refresh();
    });
  }

  return [signOut, isPending] as const;
}

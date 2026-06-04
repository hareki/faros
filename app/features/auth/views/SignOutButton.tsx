'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { authClient } from '@/app/lib/better-auth/client';
import { type NextRoute } from '@/app/types/common';

export default function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSignOut = () => {
    startTransition(async () => {
      await authClient.signOut();
      router.push('/sign-in' satisfies NextRoute);
      router.refresh();
    });
  };

  return (
    <button type='button' onClick={onSignOut} disabled={isPending}>
      Sign out
    </button>
  );
}

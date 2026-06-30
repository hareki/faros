'use client';

import { useOptimistic, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { toggleFavoriteAction } from '@/src/features/application/actions/toggleFavoriteAction';
import { toast } from '@/src/lib/sonner/toast';

type UseToggleFavoriteParams = {
  id: string;
  favorite: boolean;
};

type UseToggleFavoriteOptions = {
  errorMessage: string;
};

/**
 * Drives a board card's favorite star: flips it optimistically, persists the new value via
 * {@link toggleFavoriteAction}, then refreshes so the server value becomes the new base. On
 * failure the optimistic value reverts (no refresh) and an error toast is shown. The optimistic
 * base is read from the `favorite` prop each render, so `router.refresh()` reconciles cleanly.
 */
export function useToggleFavorite(
  { id, favorite }: UseToggleFavoriteParams,
  { errorMessage }: UseToggleFavoriteOptions,
) {
  const router = useRouter();
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(favorite);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = !optimisticFavorite;

    startTransition(async () => {
      setOptimisticFavorite(next);

      const result = await toggleFavoriteAction({ id, favorite: next });

      if (result.status === 'error') {
        toast.error(errorMessage);

        return;
      }

      router.refresh();
    });
  };

  return { favorite: optimisticFavorite, isPending, toggle };
}

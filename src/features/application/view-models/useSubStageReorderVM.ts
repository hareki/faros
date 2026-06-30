'use client';

import { useEffect, useState, useTransition } from 'react';

import { move } from '@dnd-kit/helpers';
import { type DragEndEvent } from '@dnd-kit/react';
import { useRouter } from 'next/navigation';

import { reorderSubStagesAction } from '@/src/features/application/actions/reorderSubStagesAction';
import { type SubStageRow } from '@/src/features/application/db/queries';
import { toast } from '@/src/lib/sonner/toast';

type Stage = 'active' | 'final_stages';

export function useSubStageReorderVM(stage: Stage, initial: SubStageRow[], errorMessage: string) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Re-seed when the server data changes (after a refresh).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(initial);
  }, [initial]);

  const onDragEnd = (event: DragEndEvent) => {
    const next = move(items, event);

    if (next === items) {
      return;
    }

    setItems(next);
    startTransition(async () => {
      const result = await reorderSubStagesAction({ stage, orderedIds: next.map((s) => s.id) });

      if (result.status === 'error') {
        setItems(initial);
        toast.error(errorMessage);

        return;
      }

      router.refresh();
    });
  };

  return { items, onDragEnd };
}

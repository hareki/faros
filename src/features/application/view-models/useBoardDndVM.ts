'use client';

import { useEffect, useState, useTransition } from 'react';

import { type DragEndEvent } from '@dnd-kit/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { moveStageAction } from '@/src/features/application/actions/moveStageAction';
import { type BoardApplication, type BoardStage } from '@/src/features/application/types';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { resolveErrorMessage } from '@/src/lib/next-intl/utils/resolveErrorMessage';
import { toast } from '@/src/lib/sonner/toast';

type PendingClose = { applicationId: string };

/**
 * Drives drag-and-drop between board columns. Holds an optimistic copy of the application list
 * (re-seeded whenever the server prop changes) and exposes an `onDragEnd` handler: dropping onto a
 * non-closed column moves the card optimistically and calls `moveStageAction` (reverting + toasting
 * on failure, refreshing on success); dropping onto Closed defers to `CloseOutcomePrompt` via
 * `pendingClose` without moving the card (the prompt's `closeApplicationAction` + refresh is the
 * source of truth).
 */
export function useBoardDndVM(
  applications: BoardApplication[],
  messages: ClientMessages['trackerBoard'],
) {
  const t = useTranslations('validation');
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useState(applications);
  const [pendingClose, setPendingClose] = useState<PendingClose | null>(null);

  // Re-seed when the server data changes (after a refresh).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptimistic(applications);
  }, [applications]);

  // The move action's error union is wider than this map (only errorNoActiveJobHunt is localized
  // here), so the `||` fallback below catches unknown keys such as errorApplicationNotFound.
  const errorMessages: Record<string, string> = messages.quickAdd.errors;

  const clearPendingClose = () => {
    setPendingClose(null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { source, target } = event.operation;

    if (event.canceled || !source || !target) {
      return;
    }

    const appId = String(source.id);
    const toStage = String(target.id) as BoardStage;

    const current = optimistic.find((application) => application.id === appId);

    if (!current || current.stage === toStage) {
      return;
    }

    if (toStage === 'closed') {
      // Closing needs an outcome, so the prompt (not moveStageAction) owns this move; the card
      // stays put until closeApplicationAction + router.refresh re-renders it under Closed.
      setPendingClose({ applicationId: appId });

      return;
    }

    // Capture the pre-move list so a failed mutation reverts to the exact prior state.
    const previous = optimistic;

    setOptimistic(
      optimistic.map((application) =>
        application.id === appId ? { ...application, stage: toStage, subStage: null } : application,
      ),
    );

    startTransition(async () => {
      const result = await moveStageAction({ id: appId, to: toStage });

      if (result.status === 'error') {
        setOptimistic(previous);

        const message = resolveErrorMessage(t, errorMessages, result.errorKey);

        toast.error(message || t('errorGeneric'));

        return;
      }

      router.refresh();
    });
  };

  return {
    applications: optimistic,
    onDragEnd,
    pendingClose,
    clearPendingClose,
  };
}

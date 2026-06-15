'use client';

import { Fragment, useState, useTransition } from 'react';

import { IconArchive, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  GhostIconButtonGroup,
  GhostIconButtonGroupItem,
} from '@/app/components/ui/GhostIconButtonGroup';
import { deleteJobHuntAction } from '@/app/features/job-hunt/actions/deleteJobHuntAction';
import { endJobHuntAction } from '@/app/features/job-hunt/actions/endJobHuntAction';
import { useJobHuntContext } from '@/app/features/job-hunt/hooks/useJobHuntContext';
import { type JobHuntSummary } from '@/app/features/job-hunt/types';
import { resolveErrorMessage } from '@/app/features/job-hunt/utils/resolveMessage';
import { jobHuntHref } from '@/app/features/job-hunt/utils/selectedJobHunt';
import { ConfirmByNameDialogView } from '@/app/features/job-hunt/views/ConfirmByNameDialogView';
import { RenameJobHuntDialogView } from '@/app/features/job-hunt/views/RenameJobHuntDialogView';
import { StartJobHuntDialog } from '@/app/features/job-hunt/views/StartJobHuntDialogView';
import { confirm } from '@/app/lib/confirm/confirm';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';
import { toast } from '@/app/lib/sonner/toast';

type DialogState =
  | { kind: 'start' }
  | { kind: 'startBlocked' }
  | { kind: 'rename'; jobHunt: JobHuntSummary }
  | { kind: 'end'; jobHunt: JobHuntSummary }
  | { kind: 'delete'; jobHunt: JobHuntSummary }
  | null;

type JobHuntActionGroupProps = {
  dialogMessages: ClientMessages['layout']['jobHuntDialogs'];
};

export function JobHuntActionGroup({ dialogMessages }: JobHuntActionGroupProps) {
  const t = useTranslations('validation');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { activeJobHunt, selectedJobHunt } = useJobHuntContext();

  const [dialog, setDialog] = useState<DialogState>(null);
  const closeDialog = (open: boolean) => {
    if (!open) {
      setDialog(null);
    }
  };

  const reportError = (errorKey: Parameters<typeof resolveErrorMessage>[2]) => {
    toast.error(resolveErrorMessage(t, dialogMessages.errors, errorKey));
  };

  const confirmEndJobHunt = (jobHunt: JobHuntSummary) => {
    startTransition(async () => {
      const result = await endJobHuntAction({ id: jobHunt.id });

      if (result.status === 'error') {
        reportError(result.errorKey);

        return;
      }

      setDialog(null);
      // Keep the just-ended hunt selected (now via the URL param) so its Retro is what we land on.
      router.push(jobHuntHref('/retro', jobHunt.id));
      router.refresh();
    });
  };

  const confirmDeleteJobHunt = (jobHunt: JobHuntSummary) => {
    startTransition(async () => {
      const result = await deleteJobHuntAction({ id: jobHunt.id });

      if (result.status === 'error') {
        reportError(result.errorKey);

        return;
      }

      setDialog(null);
      // The selected hunt is gone; land on the bare Dashboard and let the server canonicalize the
      // URL to the new fallback selection (active => most-recent ended => none).
      router.push('/dashboard');
      router.refresh();
    });
  };

  const handleStartJobHunt = () => {
    if (!activeJobHunt) {
      setDialog({ kind: 'start' });

      return;
    }

    confirm({
      title: dialogMessages.startBlocked.title,
      content: dialogMessages.startBlocked.description,
      cancelText: dialogMessages.startBlocked.cancel,
      confirmText: dialogMessages.startBlocked.endCurrent,
      onConfirm: () => {
        if (activeJobHunt) {
          setDialog({ kind: 'end', jobHunt: activeJobHunt });
        }
      },
    });
  };

  const confirmTarget = dialog?.kind === 'end' || dialog?.kind === 'delete' ? dialog.jobHunt : null;

  return (
    <Fragment>
      <GhostIconButtonGroup>
        <GhostIconButtonGroupItem onClick={handleStartJobHunt}>
          <IconPlus />
        </GhostIconButtonGroupItem>

        {selectedJobHunt?.status === 'active' && (
          <Fragment>
            <GhostIconButtonGroupItem
              onClick={() => {
                setDialog({ kind: 'rename', jobHunt: selectedJobHunt });
              }}
            >
              <IconPencil />
            </GhostIconButtonGroupItem>
            <GhostIconButtonGroupItem
              onClick={() => {
                setDialog({ kind: 'end', jobHunt: selectedJobHunt });
              }}
            >
              <IconArchive />
            </GhostIconButtonGroupItem>
          </Fragment>
        )}

        {selectedJobHunt?.status === 'ended' && (
          <GhostIconButtonGroupItem
            onClick={() => {
              setDialog({ kind: 'delete', jobHunt: selectedJobHunt });
            }}
          >
            <IconTrash />
          </GhostIconButtonGroupItem>
        )}
      </GhostIconButtonGroup>

      <StartJobHuntDialog
        open={dialog?.kind === 'start'}
        onOpenChange={closeDialog}
        messages={dialogMessages}
      />
      <RenameJobHuntDialogView
        open={dialog?.kind === 'rename'}
        onOpenChange={closeDialog}
        messages={dialogMessages}
        jobHunt={dialog?.kind === 'rename' ? dialog.jobHunt : undefined}
      />
      <ConfirmByNameDialogView
        open={dialog?.kind === 'end'}
        onOpenChange={closeDialog}
        jobHuntName={confirmTarget?.name ?? ''}
        isPending={isPending}
        onConfirm={() => {
          if (dialog?.kind === 'end') {
            confirmEndJobHunt(dialog.jobHunt);
          }
        }}
        messages={dialogMessages.end}
      />
      <ConfirmByNameDialogView
        open={dialog?.kind === 'delete'}
        onOpenChange={closeDialog}
        jobHuntName={confirmTarget?.name ?? ''}
        isPending={isPending}
        onConfirm={() => {
          if (dialog?.kind === 'delete') {
            confirmDeleteJobHunt(dialog.jobHunt);
          }
        }}
        messages={dialogMessages.delete}
      />
    </Fragment>
  );
}

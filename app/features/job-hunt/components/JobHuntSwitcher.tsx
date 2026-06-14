'use client';

import { Fragment, useState, useTransition } from 'react';

import {
  IconArchive,
  IconBriefcase,
  IconCheck,
  IconPencil,
  IconPlus,
  IconSelector,
  IconTrash,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/DropdownMenu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/app/components/ui/Sidebar';
import { Small, Muted } from '@/app/components/ui/Typography';
import { deleteJobHuntAction } from '@/app/features/job-hunt/actions/deleteJobHuntAction';
import { endJobHuntAction } from '@/app/features/job-hunt/actions/endJobHuntAction';
import { selectJobHuntAction } from '@/app/features/job-hunt/actions/selectJobHuntAction';
import { useActiveJobHunt } from '@/app/features/job-hunt/hooks/useActiveJobHunt';
import { type JobHuntSummary } from '@/app/features/job-hunt/types';
import { resolveErrorMessage } from '@/app/features/job-hunt/utils/resolveMessage';
import { confirm } from '@/app/lib/confirm/confirm';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';
import { toast } from '@/app/lib/sonner/toast';

import { ConfirmByNameDialogView } from '../views/ConfirmByNameDialogView';
import { RenameJobHuntDialogView } from '../views/RenameJobHuntDialogView';
import { StartJobHuntDialog } from '../views/StartJobHuntDialogView';

type DialogState =
  | { kind: 'start' }
  | { kind: 'startBlocked' }
  | { kind: 'rename'; jobHunt: JobHuntSummary }
  | { kind: 'end'; jobHunt: JobHuntSummary }
  | { kind: 'delete'; jobHunt: JobHuntSummary }
  | null;

type JobHuntSwitcherProps = {
  messages: ClientMessages['layout']['jobHuntSwitcher'];
  dialogMessages: ClientMessages['layout']['jobHuntDialogs'];
};

export function JobHuntSwitcher({ messages, dialogMessages }: JobHuntSwitcherProps) {
  const t = useTranslations('validation');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { activeJobHunt, selectedJobHunt, jobHunts } = useActiveJobHunt();
  const endedJobHunts = jobHunts.filter((jobHunt) => jobHunt.status === 'ended');

  const [dialog, setDialog] = useState<DialogState>(null);
  const closeDialog = (open: boolean) => {
    if (!open) {
      setDialog(null);
    }
  };

  const reportError = (errorKey: Parameters<typeof resolveErrorMessage>[2]) => {
    toast.error(resolveErrorMessage(t, dialogMessages.errors, errorKey));
  };

  // Selecting a hunt records it in the cookie, then lands on that hunt's primary view: the
  // dashboard for the active hunt, the Retro for an ended one.
  const selectJobHunt = (jobHunt: JobHuntSummary) => {
    if (jobHunt.id === selectedJobHunt?.id) {
      return;
    }

    startTransition(async () => {
      const result = await selectJobHuntAction({ id: jobHunt.id });

      if (result.status === 'error') {
        reportError(result.errorKey);

        return;
      }

      router.push(jobHunt.status === 'active' ? '/dashboard' : '/retro');
      router.refresh();
    });
  };

  const confirmEndJobHunt = (jobHunt: JobHuntSummary) => {
    startTransition(async () => {
      const result = await endJobHuntAction({ id: jobHunt.id });

      if (result.status === 'error') {
        reportError(result.errorKey);

        return;
      }

      // Keep the just-ended hunt selected so its Retro is what the user lands on.
      await selectJobHuntAction({ id: jobHunt.id });
      setDialog(null);
      router.push('/retro');
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
      // The selection cookie was cleared server-side; fall back to the new default view.
      router.push(activeJobHunt ? '/dashboard' : '/retro');
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

  const dialogs = (
    <Fragment>
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

  // First-run: the user has no hunts at all — the switcher collapses into a single
  // "Start a hunt" CTA.
  if (!selectedJobHunt) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size='lg'
            className='border'
            onClick={() => {
              setDialog({ kind: 'start' });
            }}
          >
            <div
              className={`
                flex-center aspect-square size-8 rounded-full bg-sidebar-primary
                text-sidebar-primary-foreground
              `}
            >
              <IconPlus />
            </div>
            <Small as='span' className='truncate'>
              {messages.startJobHunt}
            </Small>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {dialogs}
      </SidebarMenu>
    );
  }

  const renderHuntItem = (jobHunt: JobHuntSummary, muted: boolean) => (
    <DropdownMenuItem
      key={jobHunt.id}
      onClick={() => {
        selectJobHunt(jobHunt);
      }}
    >
      <IconBriefcase className={muted ? 'text-muted-foreground' : undefined} />
      <span className='flex-1 truncate'>{jobHunt.name}</span>
      {selectedJobHunt.id === jobHunt.id && <IconCheck className='ml-auto' />}
    </DropdownMenuItem>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                className='
                  border
                  data-popup-open:bg-sidebar-accent
                '
              >
                <div
                  className={`
                    flex-center aspect-square size-8 rounded-full bg-sidebar-primary
                    text-sidebar-primary-foreground
                  `}
                >
                  <IconBriefcase />
                </div>
                <div className='grid flex-1 text-left text-sm/tight'>
                  <Muted as='span' className='truncate text-xs text-sidebar-foreground/70'>
                    {selectedJobHunt.status === 'active'
                      ? messages.activeJobHunt
                      : messages.endedJobHunt}
                  </Muted>
                  <Small as='span' className='truncate'>
                    {selectedJobHunt.name}
                  </Small>
                </div>
                <IconSelector className='ml-auto' />
              </SidebarMenuButton>
            }
          />

          <DropdownMenuContent align='start' className='min-w-56'>
            {activeJobHunt && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className='text-xs text-muted-foreground'>
                  {messages.activeJobHunt}
                </DropdownMenuLabel>
                {renderHuntItem(activeJobHunt, false)}
              </DropdownMenuGroup>
            )}

            {endedJobHunts.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className='text-xs text-muted-foreground'>
                  {messages.endedJobHunts}
                </DropdownMenuLabel>
                {endedJobHunts.map((jobHunt) => renderHuntItem(jobHunt, true))}
              </DropdownMenuGroup>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleStartJobHunt}>
                <IconPlus />
                {messages.startJobHunt}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {selectedJobHunt.status === 'active' ? (
                <Fragment>
                  <DropdownMenuItem
                    onClick={() => {
                      setDialog({ kind: 'rename', jobHunt: selectedJobHunt });
                    }}
                  >
                    <IconPencil />
                    {messages.renameJobHunt}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant='destructive'
                    onClick={() => {
                      setDialog({ kind: 'end', jobHunt: selectedJobHunt });
                    }}
                  >
                    <IconArchive />
                    {messages.endJobHunt}
                  </DropdownMenuItem>
                </Fragment>
              ) : (
                <DropdownMenuItem
                  variant='destructive'
                  onClick={() => {
                    setDialog({ kind: 'delete', jobHunt: selectedJobHunt });
                  }}
                >
                  <IconTrash />
                  {messages.deleteJobHunt}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      {dialogs}
    </SidebarMenu>
  );
}

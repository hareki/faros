'use client';

import { Fragment, useState, useTransition } from 'react';

import {
  IconArchive,
  IconBriefcase,
  IconPencil,
  IconPlus,
  IconSelector,
  IconTrash,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from '@/app/components/ui/Combobox';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/app/components/ui/Sidebar';
import { Small, Muted } from '@/app/components/ui/Typography';
import { deleteJobHuntAction } from '@/app/features/job-hunt/actions/deleteJobHuntAction';
import { endJobHuntAction } from '@/app/features/job-hunt/actions/endJobHuntAction';
import { useJobHuntContext } from '@/app/features/job-hunt/hooks/useJobHuntContext';
import { type JobHuntSummary } from '@/app/features/job-hunt/types';
import { resolveErrorMessage } from '@/app/features/job-hunt/utils/resolveMessage';
import { jobHuntHref } from '@/app/features/job-hunt/utils/selectedJobHunt';
import { confirm } from '@/app/lib/confirm/confirm';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';
import { toast } from '@/app/lib/sonner/toast';
import { cn } from '@/app/lib/tailwind/utils';

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

type JobHuntGroup = {
  value: string;
  label: string;
  items: JobHuntSummary[];
};

// Footer actions live inside the combobox popup but aren't selectable items, so they're plain
// buttons styled to match `ComboboxItem`.
const actionItemClassName = `
  flex w-full cursor-default items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-sm
  font-medium outline-hidden select-none
  hover:bg-foreground/10
  focus-visible:bg-foreground/10
  [&_svg]:pointer-events-none [&_svg]:shrink-0
  [&_svg:not([class*='size-'])]:size-4
`;

export function JobHuntSwitcher({ messages, dialogMessages }: JobHuntSwitcherProps) {
  const t = useTranslations('validation');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { activeJobHunt, selectedJobHunt, jobHunts } = useJobHuntContext();
  const endedJobHunts = jobHunts.filter((jobHunt) => jobHunt.status === 'ended');

  const [dialog, setDialog] = useState<DialogState>(null);
  const [open, setOpen] = useState(false);
  const closeDialog = (open: boolean) => {
    if (!open) {
      setDialog(null);
    }
  };

  const reportError = (errorKey: Parameters<typeof resolveErrorMessage>[2]) => {
    toast.error(resolveErrorMessage(t, dialogMessages.errors, errorKey));
  };

  // Selecting a hunt writes it to the `?job_hunt` URL param by navigating to that hunt's primary
  // view: the Dashboard for the active hunt, the Retro for an ended one.
  const selectJobHunt = (jobHunt: JobHuntSummary) => {
    if (jobHunt.id === selectedJobHunt?.id) {
      return;
    }

    router.push(jobHuntHref(jobHunt.status === 'active' ? '/dashboard' : '/retro', jobHunt.id));
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

  const runAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  const groups: JobHuntGroup[] = [
    ...(activeJobHunt
      ? [{ value: 'active', label: messages.activeJobHunt, items: [activeJobHunt] }]
      : []),
    ...(endedJobHunts.length > 0
      ? [{ value: 'ended', label: messages.endedJobHunts, items: endedJobHunts }]
      : []),
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Combobox
          items={groups}
          value={selectedJobHunt}
          onValueChange={(jobHunt: JobHuntSummary | null) => {
            if (jobHunt) {
              selectJobHunt(jobHunt);
            }
          }}
          itemToStringLabel={(jobHunt: JobHuntSummary) => jobHunt.name}
          isItemEqualToValue={(a: JobHuntSummary, b: JobHuntSummary) => a.id === b.id}
          open={open}
          onOpenChange={setOpen}
        >
          <ComboboxTrigger
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

          <ComboboxContent align='start' className='min-w-56'>
            <ComboboxInput showTrigger={false} placeholder={messages.searchPlaceholder} />
            <ComboboxEmpty />
            <ComboboxList>
              {(group: JobHuntGroup, index: number) => (
                <ComboboxGroup key={group.value} items={group.items}>
                  <ComboboxLabel>{group.label}</ComboboxLabel>
                  <ComboboxCollection>
                    {(jobHunt: JobHuntSummary) => (
                      <ComboboxItem key={jobHunt.id} value={jobHunt}>
                        <IconBriefcase
                          className={
                            jobHunt.status === 'ended' ? 'text-muted-foreground' : undefined
                          }
                        />
                        <span className='flex-1 truncate'>{jobHunt.name}</span>
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                  {index < groups.length - 1 && <ComboboxSeparator />}
                </ComboboxGroup>
              )}
            </ComboboxList>

            <div className='p-1.5 pt-0'>
              <ComboboxSeparator />
              <button
                type='button'
                className={cn(actionItemClassName)}
                onClick={() => {
                  runAction(handleStartJobHunt);
                }}
              >
                <IconPlus />
                {messages.startJobHunt}
              </button>

              <ComboboxSeparator />
              {selectedJobHunt.status === 'active' ? (
                <Fragment>
                  <button
                    type='button'
                    className={cn(actionItemClassName)}
                    onClick={() => {
                      runAction(() => {
                        setDialog({ kind: 'rename', jobHunt: selectedJobHunt });
                      });
                    }}
                  >
                    <IconPencil />
                    {messages.renameJobHunt}
                  </button>
                  <button
                    type='button'
                    data-variant='destructive'
                    className={cn(actionItemClassName)}
                    onClick={() => {
                      runAction(() => {
                        setDialog({ kind: 'end', jobHunt: selectedJobHunt });
                      });
                    }}
                  >
                    <IconArchive />
                    {messages.endJobHunt}
                  </button>
                </Fragment>
              ) : (
                <button
                  type='button'
                  data-variant='destructive'
                  className={cn(actionItemClassName)}
                  onClick={() => {
                    runAction(() => {
                      setDialog({ kind: 'delete', jobHunt: selectedJobHunt });
                    });
                  }}
                >
                  <IconTrash />
                  {messages.deleteJobHunt}
                </button>
              )}
            </div>
          </ComboboxContent>
        </Combobox>
      </SidebarMenuItem>
      {dialogs}
    </SidebarMenu>
  );
}

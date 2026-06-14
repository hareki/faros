'use client';

import { Fragment, useState } from 'react';

import {
  IconArchive,
  IconArrowRight,
  IconBriefcase,
  IconCheck,
  IconPencil,
  IconPlus,
  IconSelector,
} from '@tabler/icons-react';

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
import { confirm } from '@/app/lib/confirm/confirm';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { activeSketchJobHunt, endedSketchJobHunts, type SketchJobHunt } from './sketchData';
import { RenameJobHuntDialogView } from '../views/RenameJobHuntDialogView';
import { StartJobHuntDialog } from '../views/StartJobHuntDialogView';

type DialogState = {
  kind: 'start' | 'rename';
  jobHunt?: SketchJobHunt;
} | null;

type JobHuntSwitcherProps = {
  messages: ClientMessages['layout']['jobHuntSwitcher'];
  dialogMessages: ClientMessages['layout']['jobHuntDialogs'];
};

export function JobHuntSwitcher({ messages, dialogMessages }: JobHuntSwitcherProps) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const closeDialog = (open: boolean) => {
    if (!open) {
      setDialog(null);
    }
  };
  const confirmEndJobHunt = () => {
    confirm.destructive({
      title: dialogMessages.end.title,
      content: dialogMessages.end.description,
      confirmText: dialogMessages.end.confirm,
      cancelText: dialogMessages.end.cancel,
      onConfirm: () => {
        // TODO(L76): call the endJobHunt server action.
      },
    });
  };

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
        jobHunt={dialog?.jobHunt}
      />
    </Fragment>
  );

  // First-run: no active hunt — the switcher collapses into a single "Start a hunt" CTA.
  if (!activeSketchJobHunt) {
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

  const activeJobHunt = activeSketchJobHunt;

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
                    {messages.activeJobHunt}
                  </Muted>
                  <Small as='span' className='truncate'>
                    {activeJobHunt.name}
                  </Small>
                </div>
                <IconSelector className='ml-auto' />
              </SidebarMenuButton>
            }
          />

          <DropdownMenuContent align='start' className='min-w-56'>
            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-xs text-muted-foreground'>
                {messages.jobHunts}
              </DropdownMenuLabel>
              <DropdownMenuItem>
                <IconBriefcase />
                <span className='flex-1 truncate'>{activeJobHunt.name}</span>
                <IconCheck className='ml-auto' />
              </DropdownMenuItem>
            </DropdownMenuGroup>

            {endedSketchJobHunts.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className='text-xs text-muted-foreground'>
                  {messages.endedJobHunts}
                </DropdownMenuLabel>
                {endedSketchJobHunts.map((jobHunt) => (
                  // TODO(L77): link ended hunt to its Retro.
                  <DropdownMenuItem key={jobHunt.id}>
                    <IconBriefcase className='text-muted-foreground' />
                    <span className='flex-1 truncate'>{jobHunt.name}</span>
                    <IconArrowRight className='ml-auto text-muted-foreground' />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  setDialog({ kind: 'rename', jobHunt: activeJobHunt });
                }}
              >
                <IconPencil />
                {messages.renameJobHunt}
              </DropdownMenuItem>
              <DropdownMenuItem variant='destructive' onClick={confirmEndJobHunt}>
                <IconArchive />
                {messages.endJobHunt}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  setDialog({ kind: 'start' });
                }}
              >
                <IconPlus />
                {messages.startJobHunt}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      {dialogs}
    </SidebarMenu>
  );
}

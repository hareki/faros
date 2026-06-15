'use client';

import { useState } from 'react';

import { IconBriefcase, IconPlus, IconSelector } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

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
import { useJobHuntContext } from '@/app/features/job-hunt/hooks/useJobHuntContext';
import { type JobHuntSummary } from '@/app/features/job-hunt/types';
import { jobHuntHref } from '@/app/features/job-hunt/utils/selectedJobHunt';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { StartJobHuntDialog } from '../views/StartJobHuntDialogView';

type JobHuntSwitcherProps = {
  messages: ClientMessages['layout']['jobHuntSwitcher'];
  dialogMessages: ClientMessages['layout']['jobHuntDialogs'];
};

type JobHuntGroup = {
  value: string;
  label: string;
  items: JobHuntSummary[];
};

export function JobHuntSwitcher({ messages, dialogMessages }: JobHuntSwitcherProps) {
  const router = useRouter();

  const { activeJobHunt, selectedJobHunt, jobHunts } = useJobHuntContext();
  const endedJobHunts = jobHunts.filter((jobHunt) => jobHunt.status === 'ended');

  const [open, setOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);

  // Selecting a hunt writes it to the `?job_hunt` URL param by navigating to that hunt's primary
  // view: the Dashboard for the active hunt, the Retro for an ended one.
  const selectJobHunt = (jobHunt: JobHuntSummary) => {
    if (jobHunt.id === selectedJobHunt?.id) {
      return;
    }

    router.push(jobHuntHref(jobHunt.status === 'active' ? '/dashboard' : '/retro', jobHunt.id));
  };

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
              setStartOpen(true);
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
        <StartJobHuntDialog
          open={startOpen}
          onOpenChange={setStartOpen}
          messages={dialogMessages}
        />
      </SidebarMenu>
    );
  }

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
          </ComboboxContent>
        </Combobox>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

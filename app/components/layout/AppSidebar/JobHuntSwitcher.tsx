'use client';

import { IconBriefcase, IconCheck, IconSelector, IconPlus } from '@tabler/icons-react';

import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/DropdownMenu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../ui/Sidebar';

const hunts = [
  { name: '2026 Senior FE Hunt', active: true },
  { name: '2024 New Grad Hunt', active: false },
];

export function JobHuntSwitcher({
  messages,
}: {
  messages: ClientMessages['layout']['jobHuntSwitcher'];
}) {
  const activeHunt = hunts.find((hunt) => hunt.active) ?? hunts[0];

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
                  <span className='truncate text-xs text-sidebar-foreground/70'>
                    {messages.activeJobHunt}
                  </span>
                  <span className='truncate font-medium'>{activeHunt.name}</span>
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
            </DropdownMenuGroup>

            <DropdownMenuGroup>
              {hunts.map((hunt) => (
                <DropdownMenuItem key={hunt.name}>
                  <IconBriefcase />
                  <span className='flex-1 truncate'>{hunt.name}</span>
                  {hunt.active && <IconCheck className='ml-auto' />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconPlus />
                {messages.startJobHunt}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

'use client';

import { Fragment } from 'react';

import {
  type Icon,
  IconBell,
  IconChartHistogram,
  IconChevronRight,
  IconFileText,
  IconLayoutDashboard,
  IconLayoutKanban,
  IconListTree,
  IconSettings,
  IconTag,
} from '@tabler/icons-react';
import { type Route } from 'next';
import { usePathname } from 'next/navigation';

import { useActiveJobHunt } from '@/app/features/job-hunt/hooks/useActiveJobHunt';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/Collapsible';
import { Link } from '../../ui/Link';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '../../ui/Sidebar';

type NavLeaf = {
  key: keyof ClientMessages['layout']['nav'];
  url: Route;
  icon: Icon;
};

const workspaceItems: NavLeaf[] = [
  { key: 'resumeLibrary', url: '/resume-library', icon: IconFileText },
];

const settingsItems: NavLeaf[] = [
  { key: 'tags', url: '/settings/tags', icon: IconTag },
  { key: 'subStages', url: '/settings/sub-stages', icon: IconListTree },
  { key: 'notification', url: '/settings/notification', icon: IconBell },
];

export function NavMain({ messages }: { messages: ClientMessages['layout']['nav'] }) {
  const pathname = usePathname();
  const { selectedJobHunt } = useActiveJobHunt();

  // The hunt-scoped slot follows the selected hunt: an active hunt opens on its Dashboard, an
  // ended hunt on its (read-only) Retro. The Tracker Board stays available for both.
  const huntPrimary: NavLeaf =
    selectedJobHunt?.status === 'ended'
      ? { key: 'retro', url: '/retro', icon: IconChartHistogram }
      : { key: 'dashboard', url: '/dashboard', icon: IconLayoutDashboard };
  const huntItems: NavLeaf[] = [
    huntPrimary,
    { key: 'trackerBoard', url: '/tracker-board', icon: IconLayoutKanban },
  ];

  const renderLeaf = (item: NavLeaf) => (
    <SidebarMenuItem key={item.url}>
      <SidebarMenuButton
        isActive={pathname === item.url}
        render={<Link href={item.url} variant='unstyled' />}
      >
        <item.icon />
        <span>{messages[item.key]}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Fragment>
      {/* Dashboard/Retro + Tracker Board follow the selected hunt — hidden only in first-run. */}
      {selectedJobHunt && (
        <SidebarGroup>
          <SidebarGroupLabel>{messages.huntSection}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{huntItems.map(renderLeaf)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Resume Library + Settings are user-global — always available, hunt-independent. */}
      <SidebarGroup>
        <SidebarGroupLabel>{messages.workspaceSection}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {workspaceItems.map(renderLeaf)}

            <Collapsible defaultOpen render={<SidebarMenuItem />}>
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton>
                    <IconSettings />
                    <span>{messages.settings}</span>
                    <IconChevronRight
                      className={`
                        ml-auto transition-transform
                        group-data-panel-open/menu-button:rotate-90
                      `}
                    />
                  </SidebarMenuButton>
                }
              />
              <CollapsibleContent>
                <SidebarMenuSub>
                  {settingsItems.map((item) => (
                    <SidebarMenuSubItem key={item.url}>
                      <SidebarMenuSubButton
                        isActive={pathname === item.url}
                        render={<Link href={item.url} variant='unstyled' />}
                      >
                        <item.icon />
                        <span>{messages[item.key]}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </Fragment>
  );
}

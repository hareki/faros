'use client';

import {
  type Icon,
  IconBell,
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

import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/Collapsible';
import Link from '../../ui/Link';
import {
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

const navItems: NavLeaf[] = [
  { key: 'dashboard', url: '/dashboard', icon: IconLayoutDashboard },
  { key: 'trackerBoard', url: '/tracker-board', icon: IconLayoutKanban },
  { key: 'resumeLibrary', url: '/resume-library', icon: IconFileText },
];

const settingsItems: NavLeaf[] = [
  { key: 'tags', url: '/settings/tags', icon: IconTag },
  { key: 'subStages', url: '/settings/sub-stages', icon: IconListTree },
  { key: 'notification', url: '/settings/notification', icon: IconBell },
];

export function NavMain({ messages }: { messages: ClientMessages['layout']['nav'] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            isActive={pathname === item.url}
            render={<Link href={item.url} variant='unstyled' />}
          >
            <item.icon />
            <span>{messages[item.key]}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

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
  );
}

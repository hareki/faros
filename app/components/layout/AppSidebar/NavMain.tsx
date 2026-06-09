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
  title: string;
  url: Route;
  icon: Icon;
};

const navItems: NavLeaf[] = [
  { title: 'Dashboard', url: '/dashboard', icon: IconLayoutDashboard },
  { title: 'Tracker Board', url: '/tracker-board', icon: IconLayoutKanban },
  { title: 'Resume Library', url: '/resume-library', icon: IconFileText },
];

const settingsItems: NavLeaf[] = [
  { title: 'Tags', url: '/settings/tags', icon: IconTag },
  { title: 'Sub-stages', url: '/settings/sub-stages', icon: IconListTree },
  { title: 'Notification', url: '/settings/notification', icon: IconBell },
];

export function NavMain() {
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
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

      <Collapsible defaultOpen render={<SidebarMenuItem />}>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton>
              <IconSettings />
              <span>Settings</span>
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
                  <span>{item.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenu>
  );
}

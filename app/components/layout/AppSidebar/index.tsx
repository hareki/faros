import { getMessages } from 'next-intl/server';

import BrandButton from './BrandButton';
import { JobHuntSwitcher } from './JobHuntSwitcher';
import { NavMain } from './NavMain';
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader } from '../../ui/Sidebar';

export async function AppSidebar() {
  const messages = await getMessages();

  return (
    <Sidebar variant='floating' collapsible='icon'>
      <SidebarHeader>
        <BrandButton />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className='pb-0'>
          <JobHuntSwitcher messages={messages.ClientLayout.jobHuntSwitcher} />
        </SidebarGroup>
        <SidebarGroup>
          <NavMain messages={messages.ClientLayout.nav} />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

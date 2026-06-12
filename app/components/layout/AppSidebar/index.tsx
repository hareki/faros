import { getClientMessages } from '@/app/lib/next-intl/utils/getClientMessages';

import BrandButton from './BrandButton';
import { JobHuntSwitcher } from './JobHuntSwitcher';
import { NavMain } from './NavMain';
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader } from '../../ui/Sidebar';

export async function AppSidebar() {
  const clientMessages = await getClientMessages();

  return (
    <Sidebar variant='floating' collapsible='icon'>
      <SidebarHeader>
        <BrandButton />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className='pb-0'>
          <JobHuntSwitcher messages={clientMessages.layout.jobHuntSwitcher} />
        </SidebarGroup>
        <SidebarGroup>
          <NavMain messages={clientMessages.layout.nav} />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

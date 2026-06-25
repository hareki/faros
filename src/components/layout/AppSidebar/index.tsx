import { JobHuntSwitcher } from '@/src/features/job-hunt/components/JobHuntSwitcher';
import { getClientMessages } from '@/src/lib/next-intl/utils/getClientMessages';

import { BrandButton } from './BrandButton';
import { NavMain } from './NavMain';
import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup } from '../../ui/Sidebar';

export async function AppSidebar() {
  const clientMessages = await getClientMessages();

  return (
    <Sidebar variant='floating' collapsible='icon'>
      <SidebarHeader>
        <BrandButton />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className='pb-0'>
          <JobHuntSwitcher
            messages={clientMessages.layout.jobHuntSwitcher}
            dialogMessages={clientMessages.layout.jobHuntDialogs}
          />
        </SidebarGroup>
        <NavMain messages={clientMessages.layout.nav} />
      </SidebarContent>
    </Sidebar>
  );
}

import BrandButton from './BrandButton';
import { JobHuntSwitcher } from './JobHuntSwitcher';
import { NavMain } from './NavMain';
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader } from '../../ui/Sidebar';

export function AppSidebar() {
  return (
    <Sidebar variant='floating' collapsible='icon' /* className='pr-0' */>
      <SidebarHeader>
        <BrandButton />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className='pb-0'>
          <JobHuntSwitcher />
        </SidebarGroup>
        <SidebarGroup>
          <NavMain />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

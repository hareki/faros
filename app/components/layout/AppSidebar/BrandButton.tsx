import FavIcon from '../../icons/FavIcon';
import Link from '../../ui/Link';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../ui/Sidebar';
import { H3 } from '../../ui/Typography';

export default function BrandButton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip='Faros'
          className='
            h-fit py-2
            group-data-[collapsible=icon]:p-0!
          '
          render={<Link href='/dashboard' variant='unstyled' />}
        >
          <FavIcon className='size-8!' />
          <H3 as='h1'>Faros</H3>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

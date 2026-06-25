'use client';

import { useJobHuntContext } from '@/src/features/job-hunt/hooks/useJobHuntContext';
import { jobHuntHref } from '@/src/features/job-hunt/utils/selectedJobHunt';

import { FavIcon } from '../../icons/FavIcon';
import { Link } from '../../ui/Link';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../ui/Sidebar';
import { H3 } from '../../ui/Typography';

export function BrandButton() {
  const { selectedJobHunt } = useJobHuntContext();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip='Faros'
          className='
            h-fit py-2
            group-data-[collapsible=icon]:p-0!
          '
          render={<Link href={jobHuntHref('/dashboard', selectedJobHunt?.id)} variant='unstyled' />}
        >
          <FavIcon className='size-8!' />
          <H3 as='span'>Faros</H3>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

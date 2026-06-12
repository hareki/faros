'use client';

import { IconLogout, IconChevronDown } from '@tabler/icons-react';

import { useSignOut } from '@/app/features/auth/hooks/useSignOut';
import { type ClientMessages } from '@/app/lib/next-intl/clientMessages';

import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from '../../ui/DropdownMenu';

export function NavUser({
  user,
  messages,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  messages: ClientMessages['layout']['navUser'];
}) {
  const [signOut] = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='ghost' size='icon'>
            <Avatar className='size-8'>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className='rounded-full'>CN</AvatarFallback>
              <AvatarBadge className='bg-secondary text-secondary-foreground'>
                <IconChevronDown />
              </AvatarBadge>
            </Avatar>
          </Button>
        }
      />

      <DropdownMenuContent
        className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
        side='bottom'
        align='end'
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className='p-0 font-normal'>
            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
              <Avatar className='size-8 rounded-lg'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm/tight'>
                <span className='truncate font-medium'>{user.name}</span>
                <span className='truncate text-xs'>{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={signOut}>
            <IconLogout />
            {messages.signOut}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

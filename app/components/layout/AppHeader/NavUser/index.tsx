'use client';

import { IconLogout, IconChevronDown } from '@tabler/icons-react';

import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '@/app/components/ui/Avatar';
import { Button } from '@/app/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from '@/app/components/ui/DropdownMenu';
import { Muted, Text } from '@/app/components/ui/Typography';
import { useSignOut } from '@/app/features/auth/hooks/useSignOut';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

type NavUserProps = {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  messages: ClientMessages['layout']['navUser'];
  themeMessages: ClientMessages['layout']['theme'];
  localeMessages: ClientMessages['layout']['locale'];
};

export function NavUser({ user, messages, themeMessages, localeMessages }: NavUserProps) {
  const [signOut] = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='ghost' size='icon'>
            <Avatar className='size-10'>
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
              <Avatar className='size-10 rounded-full'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm/tight'>
                <Text className='truncate font-medium'>{user.name}</Text>
                <Muted className='truncate'>{user.email}</Muted>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <ThemeSwitcher messages={themeMessages} />
          <LocaleSwitcher messages={localeMessages} />
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

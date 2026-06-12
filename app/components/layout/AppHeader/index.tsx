import { IconBell, IconSearch } from '@tabler/icons-react';
import { getTranslations } from 'next-intl/server';

import { getClientMessages } from '@/app/lib/next-intl/utils/getClientMessages';

import { NavUser } from './NavUser';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { SidebarTrigger } from '../../ui/Sidebar';

export async function AppHeader() {
  const t = await getTranslations('layout');
  const clientMessages = await getClientMessages();

  return (
    <header className='flex shrink-0 items-center justify-between gap-2 border-b p-3'>
      <div className='flex gap-2'>
        <SidebarTrigger />
        <Input placeholder={t('search')} variant='outline' icon={<IconSearch />} />
      </div>

      <div className='flex gap-2'>
        <Button size='icon' variant='outline'>
          <IconBell />
        </Button>
        <NavUser
          messages={clientMessages.layout.navUser}
          user={{
            name: 'shadcn',
            email: 'm@example.com',
            avatar: '/shadcn.jpg',
          }}
        />
      </div>
    </header>
  );
}

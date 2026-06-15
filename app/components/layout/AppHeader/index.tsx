import { getClientMessages } from '@/app/lib/next-intl/utils/getClientMessages';

import { GlobalSearch } from './GlobalSearch';
import { JobHuntActionGroup } from './JobHuntActionGroup';
import { NavUser } from './NavUser';
import { NotificationButton } from './Notification';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SidebarTrigger } from '../../ui/Sidebar';

export async function AppHeader() {
  const clientMessages = await getClientMessages();

  return (
    <header className='flex shrink-0 items-center justify-between gap-2 border-b p-3'>
      <div className='flex gap-2'>
        <SidebarTrigger />
        <JobHuntActionGroup dialogMessages={clientMessages.layout.jobHuntDialogs} />
        <GlobalSearch />
      </div>

      <div className='flex gap-2'>
        <ThemeSwitcher messages={clientMessages.layout.theme} />
        <NotificationButton />

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

import { type PropsWithChildren } from 'react';

import { AppHeader } from '@/app/components/layout/AppHeader';
import { AppSidebar } from '@/app/components/layout/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/app/components/ui/Sidebar';
import { requireUser } from '@/app/lib/better-auth/session';

export default async function PrivateLayout({ children }: PropsWithChildren) {
  await requireUser();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='-ml-3'>
        <AppHeader />
        <main className='p-3'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

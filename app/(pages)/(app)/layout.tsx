import { type PropsWithChildren } from 'react';

import { AppSidebar } from '@/app/components/layout/AppSidebar';
import { SidebarProvider } from '@/app/components/ui/Sidebar';
import { requireUser } from '@/app/lib/better-auth/session';

export default async function PrivateLayout({ children }: PropsWithChildren) {
  await requireUser();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main>{children}</main>
    </SidebarProvider>
  );
}

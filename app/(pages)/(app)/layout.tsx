import { type PropsWithChildren } from 'react';

import { AppHeader } from '@/app/components/layout/AppHeader';
import { AppSidebar } from '@/app/components/layout/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/app/components/ui/Sidebar';
import { JobHuntFirstRun } from '@/app/features/job-hunt/components/JobHuntFirstRun';
import { activeSketchJobHunt } from '@/app/features/job-hunt/components/sketchData';
import { requireUser } from '@/app/lib/better-auth/session';
import { getClientMessages } from '@/app/lib/next-intl/utils/getClientMessages';

export default async function PrivateLayout({ children }: PropsWithChildren) {
  await requireUser();
  const clientMessages = await getClientMessages();

  return (
    <SidebarProvider>
      <AppSidebar />
      {/* HACK: Make app header border connect to sidebar without adjusting the sidebar padding right,
         since the padding is used to compute collapsed state with */}
      <SidebarInset className='-ml-3'>
        <AppHeader />
        <main className='flex flex-1 flex-col p-3'>
          {activeSketchJobHunt ? (
            children
          ) : (
            <JobHuntFirstRun
              messages={clientMessages.layout.jobHuntFirstRun}
              dialogMessages={clientMessages.layout.jobHuntDialogs}
            />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

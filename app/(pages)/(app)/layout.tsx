import { type PropsWithChildren } from 'react';

import { AppHeader } from '@/app/components/layout/AppHeader';
import { AppSidebar } from '@/app/components/layout/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/app/components/ui/Sidebar';
import { db } from '@/app/db/client';
import { ActiveHuntProvider } from '@/app/features/job-hunt/components/ActiveHuntProvider';
import { EmptyJobHunt } from '@/app/features/job-hunt/components/EmptyJobHunt';
import { listJobHunts } from '@/app/features/job-hunt/db/queries';
import {
  pickSelectedJobHunt,
  readSelectedJobHuntId,
} from '@/app/features/job-hunt/server/selectedJobHunt';
import { requireUser } from '@/app/lib/better-auth/session';
import { getClientMessages } from '@/app/lib/next-intl/utils/getClientMessages';

export default async function PrivateLayout({ children }: PropsWithChildren) {
  const user = await requireUser();
  const clientMessages = await getClientMessages();

  const jobHunts = (await listJobHunts(db, user.id)).map(({ id, name, status }) => ({
    id,
    name,
    status,
  }));
  const activeJobHunt = jobHunts.find((jobHunt) => jobHunt.status === 'active') ?? null;
  const selectedJobHunt = pickSelectedJobHunt(jobHunts, await readSelectedJobHuntId());

  return (
    <ActiveHuntProvider
      jobHunts={jobHunts}
      activeJobHunt={activeJobHunt}
      selectedJobHunt={selectedJobHunt}
    >
      <SidebarProvider>
        <AppSidebar />
        {/* HACK: Make app header border connect to sidebar without adjusting the sidebar padding right,
         since the padding is used to compute collapsed state with */}
        <SidebarInset className='-ml-3'>
          <AppHeader />
          <main className='flex flex-1 flex-col p-3'>
            {selectedJobHunt ? (
              children
            ) : (
              <EmptyJobHunt
                messages={clientMessages.layout.jobHuntEmpty}
                dialogMessages={clientMessages.layout.jobHuntDialogs}
              />
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ActiveHuntProvider>
  );
}

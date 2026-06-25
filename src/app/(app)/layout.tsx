import { type PropsWithChildren } from 'react';

import { AppHeader } from '@/src/components/layout/AppHeader';
import { AppSidebar } from '@/src/components/layout/AppSidebar';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { SidebarInset, SidebarProvider } from '@/src/components/ui/Sidebar';
import { db } from '@/src/db/client';
import { JobHuntProvider } from '@/src/features/job-hunt/components/ActiveHuntProvider';
import { listJobHunts } from '@/src/features/job-hunt/db/queries';
import { requireUser } from '@/src/lib/better-auth/session';

export default async function PrivateLayout({ children }: PropsWithChildren) {
  const user = await requireUser();

  const jobHunts = (await listJobHunts(db, user.id)).map(({ id, name, status }) => ({
    id,
    name,
    status,
  }));
  const activeJobHunt = jobHunts.find((jobHunt) => jobHunt.status === 'active') ?? null;

  return (
    <JobHuntProvider jobHunts={jobHunts} activeJobHunt={activeJobHunt}>
      <SidebarProvider>
        <AppSidebar />
        {/* HACK: Make app header border connect to sidebar without adjusting the sidebar padding right,
         since the padding is used to compute collapsed state with */}
        <SidebarInset className='-ml-3'>
          <AppHeader />
          <PageWrapper firstRun={jobHunts.length === 0}>{children}</PageWrapper>
        </SidebarInset>
      </SidebarProvider>
    </JobHuntProvider>
  );
}

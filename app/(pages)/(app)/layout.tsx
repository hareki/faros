import { type PropsWithChildren } from 'react';

import { AppHeader } from '@/app/components/layout/AppHeader';
import { AppSidebar } from '@/app/components/layout/AppSidebar';
import { PageWrapper } from '@/app/components/layout/PageWrapper';
import { SidebarInset, SidebarProvider } from '@/app/components/ui/Sidebar';
import { db } from '@/app/db/client';
import { JobHuntProvider } from '@/app/features/job-hunt/components/ActiveHuntProvider';
import { listJobHunts } from '@/app/features/job-hunt/db/queries';
import { requireUser } from '@/app/lib/better-auth/session';

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

import { redirect } from 'next/navigation';

import { SimpleEmpty } from '@/app/components/simple/SimpleEmpty';
import { H2 } from '@/app/components/ui/Typography';
import { db } from '@/app/db/client';
import { getSelectedJobHunt } from '@/app/features/job-hunt/server/selectedJobHunt';
import { requireUser } from '@/app/lib/better-auth/session';

import { Test } from './test';

export default async function Dashboard() {
  const user = await requireUser();
  const selectedJobHunt = await getSelectedJobHunt(db, user.id);

  // The Dashboard is the active hunt's home; an ended selection belongs on its Retro. A null
  // selection (no hunts) falls through to the shell's first-run empty state.
  if (selectedJobHunt?.status === 'ended') {
    redirect('/retro');
  }

  return (
    <div>
      <H2>Dashboard Page, hello {user.name}</H2>
      <SimpleEmpty />
      <Test />
    </div>
  );
}

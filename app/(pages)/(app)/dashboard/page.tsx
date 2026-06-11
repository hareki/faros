import { SimpleEmpty } from '@/app/components/simple/SimpleEmpty';
import { H2 } from '@/app/components/ui/Typography';
import { requireUser } from '@/app/lib/better-auth/session';

import Test from './test';

export default async function Dashboard() {
  const user = await requireUser();

  return (
    <div>
      <H2>Dashboard Page, hello {user.name}</H2>
      <SimpleEmpty />
      <Test />
    </div>
  );
}

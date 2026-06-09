import { H2 } from '@/app/components/ui/Typography';
import { requireUser } from '@/app/lib/better-auth/session';

export default async function Dashboard() {
  const user = await requireUser();

  return (
    <div>
      <H2>Dashboard Page, hello {user.name}</H2>
    </div>
  );
}

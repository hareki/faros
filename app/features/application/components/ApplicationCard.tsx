import { Card, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Card';

import { type BoardApplication } from '../types';

type ApplicationCardProps = {
  application: BoardApplication;
};

/**
 * Minimal board card shell. Receives the full application so the layout can be fleshed
 * out (sub-stage chip, tag chips, source icon) later without re-plumbing data.
 */
export function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <Card size='sm' className='min-h-100 shrink-0 cursor-pointer'>
      <CardHeader>
        <CardTitle>{application.company}</CardTitle>
        <CardDescription>{application.role}</CardDescription>
      </CardHeader>
    </Card>
  );
}

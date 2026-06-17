import { IconPlus } from '@tabler/icons-react';

import { SimpleEmpty } from '@/app/components/simple/SimpleEmpty';
import { Button } from '@/app/components/ui/Button';
import { Muted, Small } from '@/app/components/ui/Typography';
import { cn } from '@/app/lib/tailwind/utils';

import { ApplicationCard } from './ApplicationCard';
import { type BoardApplication, type BoardStage } from '../types';

type BoardColumnProps = {
  stage: BoardStage;
  label: string;
  addLabel: string;
  applications: BoardApplication[];
  emptyTitle: string;
};

// Categorical dot color per stage; closed reads terminal/neutral.
const STAGE_DOT_CLASS: Record<BoardStage, string> = {
  applied: 'bg-chart-1',
  active: 'bg-chart-4',
  final_stages: 'bg-chart-2',
  closed: 'bg-muted-foreground',
};

export function BoardColumn({
  stage,
  label,
  addLabel,
  applications,
  emptyTitle,
}: BoardColumnProps) {
  return (
    <section className='scroll-layer max-h-full shrink-0 basis-80 rounded-3xl bg-muted'>
      <header className='flex shrink-0 items-center justify-between p-3'>
        <div className='flex items-center gap-2'>
          <span className={cn('size-2 rounded-full', STAGE_DOT_CLASS[stage])} />
          <Small as='h2'>{label}</Small>
          <Muted as='span'>{applications.length}</Muted>
        </div>

        {/* Opens the quick-add dialog prefilled to this column's stage once wired (todos L88). */}
        <Button size='icon-sm' variant='ghost' tooltip={addLabel}>
          <IconPlus />
        </Button>
      </header>

      {applications.length > 0 ? (
        <div className='scroll-layer gap-3 overflow-auto p-3'>
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      ) : (
        <SimpleEmpty title={emptyTitle} className='border-0 bg-transparent' />
      )}
    </section>
  );
}

'use client';

import { useState } from 'react';

import { IconPlus } from '@tabler/icons-react';

import { SimpleEmpty } from '@/src/components/simple/SimpleEmpty';
import { Button } from '@/src/components/ui/Button';
import { Muted, Small } from '@/src/components/ui/Typography';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { cn } from '@/src/lib/tailwind/utils';

import { ApplicationCard } from './ApplicationCard';
import { type BoardApplication, type BoardStage } from '../types';
import { STAGE_COLOR } from '../utils/stageColors';
import { QuickAddDialog } from '../views/QuickAddDialog';

type BoardColumnProps = {
  stage: BoardStage;
  label: string;
  addLabel: string;
  applications: BoardApplication[];
  emptyTitle: string;
  appliedVia: string;
  appliedOn: string;
  sources: ClientMessages['trackerBoard']['sources'];
  favoriteLabels: ClientMessages['trackerBoard']['favorite'];
  jobHuntId: string | null;
  readOnly: boolean;
  quickAddMessages: ClientMessages['trackerBoard']['quickAdd'];
};

export function BoardColumn({
  stage,
  label,
  addLabel,
  applications,
  emptyTitle,
  appliedVia,
  appliedOn,
  sources,
  favoriteLabels,
  jobHuntId,
  readOnly,
  quickAddMessages,
}: BoardColumnProps) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <section
      className={`
        scroll-layer max-h-full shrink-0 grow-0 basis-80 rounded-4xl bg-muted
        light:bg-crust
      `}
    >
      <header className='flex shrink-0 items-center justify-between ps-5 pe-4 pt-3 pb-0'>
        <div className='flex items-center gap-2'>
          <span className={cn('size-2 rounded-full', STAGE_COLOR[stage].dot)} />
          <Small as='h2'>{label}</Small>
          <Muted as='span'>{applications.length}</Muted>
        </div>

        {!readOnly && (
          <Button
            size='icon-sm'
            variant='ghost'
            tooltip={addLabel}
            className='
              hover:bg-background/40
              hover:dark:bg-background/40
            '
            onClick={() => {
              setAddOpen(true);
            }}
          >
            <IconPlus />
          </Button>
        )}
      </header>

      {applications.length > 0 ? (
        <div className='scroll-layer gap-3 overflow-auto p-3 pt-1'>
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              appliedVia={appliedVia}
              appliedOn={appliedOn}
              sources={sources}
              favoriteLabels={favoriteLabels}
              jobHuntId={jobHuntId}
            />
          ))}
        </div>
      ) : (
        <SimpleEmpty title={emptyTitle} className='border-0 bg-transparent' />
      )}

      <QuickAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        stage={stage}
        messages={quickAddMessages}
      />
    </section>
  );
}

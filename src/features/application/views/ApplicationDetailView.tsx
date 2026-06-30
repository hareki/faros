'use client';

import { Button } from '@/src/components/ui/Button';
import { H3, Muted } from '@/src/components/ui/Typography';
import {
  type ActivityEntry,
  type ApplicationDetail,
  type SubStageRow,
  type TagRow,
} from '@/src/features/application/db/queries';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

type ApplicationDetailViewProps = {
  variant: 'modal' | 'page';
  detail: ApplicationDetail;
  activity: ActivityEntry[];
  subStages: SubStageRow[];
  tags: TagRow[];
  messages: ClientMessages['applicationDetail'];
  activityMessages: ClientMessages['activity'];
  sourceMessages: ClientMessages['trackerBoard']['sources'];
};

// Temporary stub — Task 4.4 implements the full editing surface.
export function ApplicationDetailView({ detail, messages }: ApplicationDetailViewProps) {
  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <H3>{detail.company}</H3>
          <Muted>{detail.role}</Muted>
        </div>

        <Button variant='ghost' size='sm'>
          {messages.close}
        </Button>
      </div>
    </div>
  );
}

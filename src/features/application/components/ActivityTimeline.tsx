'use client';

import { useLocale } from 'next-intl';

import { Muted, P } from '@/src/components/ui/Typography';
import { type ActivityEntry } from '@/src/features/application/db/queries';
import { activityLabel } from '@/src/features/application/utils/activityLabel';
import { formatDate } from '@/src/lib/formatter/date';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

type ActivityTimelineProps = {
  activity: ActivityEntry[];
  messages: ClientMessages['activity'];
};

/** Renders a vertical list of activity log entries (newest first) with localized labels and timestamps. */
export function ActivityTimeline({ activity, messages }: ActivityTimelineProps) {
  const locale = useLocale();

  if (activity.length === 0) {
    return <Muted as='p'>No activity yet.</Muted>;
  }

  return (
    <div className='flex flex-col gap-3'>
      {activity.map((entry) => (
        <div key={entry.id} className='flex flex-col gap-0.5'>
          <P as='span'>{activityLabel(entry, messages)}</P>
          <Muted>{formatDate(entry.occurredAt, locale)}</Muted>
        </div>
      ))}
    </div>
  );
}

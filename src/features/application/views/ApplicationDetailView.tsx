'use client';

import { IconStar, IconStarFilled, IconX } from '@tabler/icons-react';
import NextLink from 'next/link';

import { Button } from '@/src/components/ui/Button';
import { DialogClose } from '@/src/components/ui/Dialog';
import { H3, H4, Muted } from '@/src/components/ui/Typography';
import { ApplicationMetadataForm } from '@/src/features/application/components/ApplicationMetadataForm';
import {
  type ActivityEntry,
  type ApplicationDetail,
  type SubStageRow,
  type TagRow,
} from '@/src/features/application/db/queries';
import { useToggleFavorite } from '@/src/features/application/hooks/useToggleFavorite';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { cn } from '@/src/lib/tailwind/utils';

type ApplicationDetailViewProps = {
  variant: 'modal' | 'page';
  detail: ApplicationDetail;
  activity: ActivityEntry[];
  subStages: SubStageRow[];
  tags: TagRow[];
  messages: ClientMessages['applicationDetail'];
  activityMessages: ClientMessages['activity'];
  sourceMessages: ClientMessages['trackerBoard']['sources'];
  favoriteLabels: ClientMessages['trackerBoard']['favorite'];
};

/**
 * Client shell for the application detail surface: header (company, role, favorite star, close),
 * an optional read-only banner when the owning hunt has ended, and a two-column body with
 * placeholder regions for the editing sub-components (Tasks 4.5-4.7) and static coming-soon
 * slots for resume and events. Renders as a page or inside a modal depending on `variant`.
 */
export function ApplicationDetailView({
  variant,
  detail,
  messages,
  sourceMessages,
  favoriteLabels,
}: ApplicationDetailViewProps) {
  const readOnly = detail.readOnly;

  const { favorite, toggle } = useToggleFavorite(
    { id: detail.id, favorite: detail.favorite },
    { errorMessage: favoriteLabels.error },
  );

  const favoriteLabel = favorite ? favoriteLabels.remove : favoriteLabels.add;

  const closeControl =
    variant === 'page' ? (
      <Button
        size='icon-sm'
        variant='ghost'
        render={<NextLink href={`/tracker-board?job_hunt=${detail.jobHuntId}`} />}
        aria-label={messages.close}
      >
        <IconX />
      </Button>
    ) : (
      <DialogClose render={<Button variant='ghost' size='icon-sm' aria-label={messages.close} />}>
        <IconX />
      </DialogClose>
    );

  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-start gap-2'>
          <div className='flex flex-col gap-1'>
            <H3>{detail.company}</H3>
            <Muted as='p'>{detail.role}</Muted>
          </div>

          <Button
            size='icon-sm'
            variant='ghost'
            tooltip={favoriteLabel}
            aria-label={favoriteLabel}
            aria-pressed={favorite}
            disabled={readOnly}
            onClick={toggle}
            className={cn(
              'transition-opacity',
              favorite
                ? `
                  text-warning opacity-100
                  hover:text-warning
                `
                : 'text-muted-foreground',
            )}
          >
            {favorite ? <IconStarFilled /> : <IconStar />}
          </Button>
        </div>

        {closeControl}
      </div>

      {/* Read-only banner: shown when the owning hunt has ended */}
      {readOnly ? (
        <div className='rounded-lg border border-border bg-muted px-4 py-3'>
          <Muted>{messages.readOnlyBanner}</Muted>
        </div>
      ) : null}

      {/* Two-column body: single column on small screens, two on large */}
      <div
        className='
          grid grid-cols-1 gap-6
          lg:grid-cols-[2fr_1fr]
        '
      >
        {/* LEFT column */}
        <div className='flex flex-col gap-6'>
          <ApplicationMetadataForm
            detail={detail}
            messages={messages}
            sourceMessages={sourceMessages}
            readOnly={readOnly}
          />
          {/* Task 4.6: sub-stage picker (readOnly prop) */}
          {/* Task 4.6: tags (readOnly prop) */}

          {/* Static coming-soon placeholders */}
          <div className='rounded-lg border border-dashed border-border px-4 py-3'>
            <Muted>{messages.slots.resume}</Muted>
          </div>
          <div className='rounded-lg border border-dashed border-border px-4 py-3'>
            <Muted>{messages.slots.events}</Muted>
          </div>
        </div>

        {/* RIGHT column */}
        <div className='flex flex-col gap-4'>
          <H4>{messages.timelineTitle}</H4>
          {/* Task 4.7: activity timeline (readOnly prop) */}
        </div>
      </div>
    </div>
  );
}

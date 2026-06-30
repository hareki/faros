import { useDraggable } from '@dnd-kit/react';
import { IconCalendar, IconMessages, IconStar, IconStarFilled } from '@tabler/icons-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/Card';
import { Muted, Small } from '@/src/components/ui/Typography';
import { formatDate } from '@/src/lib/formatter/date';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { cn } from '@/src/lib/tailwind/utils';

import { useToggleFavorite } from '../hooks/useToggleFavorite';
import { type BoardApplication } from '../types';
import { STAGE_COLOR } from '../utils/stageColors';

type ApplicationCardProps = {
  application: BoardApplication;
  appliedVia: string;
  appliedOn: string;
  sources: ClientMessages['trackerBoard']['sources'];
  favoriteLabels: ClientMessages['trackerBoard']['favorite'];
  jobHuntId: string | null;
  readOnly: boolean;
};

export function ApplicationCard({
  application,
  appliedVia,
  appliedOn,
  sources,
  favoriteLabels,
  jobHuntId,
  readOnly,
}: ApplicationCardProps) {
  const { company, role, stage, subStage, tags, source, appliedAt } = application;
  const locale = useLocale();

  const { ref, isDragging } = useDraggable({
    id: application.id,
    data: { stage: application.stage },
    disabled: readOnly,
  });

  const { favorite, toggle } = useToggleFavorite(
    { id: application.id, favorite: application.favorite },
    { errorMessage: favoriteLabels.error },
  );

  // Word order around the source/date differs per locale, so the footer fills a localized
  // template ("Applied via {source} on {date}") rather than concatenating fixed fragments.
  const appliedTemplate = source !== null ? appliedVia : appliedOn;

  // Sub-stage is a stage-bound pipeline chip; it only exists for Active & Final Stages
  // (ADR-0001), so the card never paints it for Applied/Closed cards.
  const showSubStage = (stage === 'active' || stage === 'final_stages') && subStage !== null;

  const favoriteLabel = favorite ? favoriteLabels.remove : favoriteLabels.add;

  const card = (
    <Card
      ref={ref}
      size='sm'
      className={cn('shrink-0 cursor-pointer rounded-3xl', isDragging && 'opacity-50')}
    >
      <CardHeader>
        <CardTitle className='font-semibold text-pretty'>{company}</CardTitle>
        <CardDescription className='text-base text-pretty'>{role}</CardDescription>

        <CardAction>
          <Button
            size='icon-sm'
            variant='ghost'
            tooltip={favoriteLabel}
            aria-label={favoriteLabel}
            aria-pressed={favorite}
            onClick={(event) => {
              event.preventDefault(); // stop the anchor's default navigation
              event.stopPropagation(); // stop bubbling to the card link
              toggle();
            }}
            className={cn(
              'transition-opacity',
              favorite
                ? `
                  text-warning opacity-100
                  hover:text-warning
                `
                : `
                  text-muted-foreground opacity-0
                  group-focus-within/card:opacity-100
                  group-hover/card:opacity-100
                `,
            )}
          >
            {favorite ? <IconStarFilled /> : <IconStar />}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className='flex items-center gap-1.5'>
        {showSubStage ? (
          <div className='flex'>
            <Badge
              variant='outline'
              className={cn('h-6 gap-1.5 px-2.5 text-sm', STAGE_COLOR[stage].subStageBadge)}
            >
              <IconMessages />
              {subStage.name}
            </Badge>
          </div>
        ) : null}

        {tags.length > 0 ? (
          <div className='flex flex-wrap gap-1.5'>
            {tags.map((tag) => (
              <Badge key={tag.id} variant='secondary' className='gap-1.5'>
                <span
                  className={cn(
                    'size-1.5 rounded-xs',
                    tag.color ? undefined : 'bg-muted-foreground',
                  )}
                  style={tag.color ? { backgroundColor: tag.color } : undefined}
                />
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className='items-start gap-1 border-t text-muted-foreground'>
        <IconCalendar className='size-4 translate-y-0.5' />
        <Muted className='text-pretty'>
          {appliedTemplate.split(/(\{source\}|\{date\})/).map((part, index) => {
            if (part === '{source}') {
              return (
                <Small key={index} as='span' className='text-foreground'>
                  {source !== null ? sources[source] : null}
                </Small>
              );
            }

            if (part === '{date}') {
              return (
                <Small
                  key={index}
                  as='time'
                  dateTime={appliedAt.toISOString()}
                  className='text-foreground'
                >
                  {formatDate(appliedAt, locale)}
                </Small>
              );
            }

            return part;
          })}
        </Muted>
      </CardFooter>
    </Card>
  );

  if (jobHuntId !== null) {
    return (
      <Link href={`/tracker-board/${application.id}?job_hunt=${jobHuntId}`} className='block'>
        {card}
      </Link>
    );
  }

  return card;
}

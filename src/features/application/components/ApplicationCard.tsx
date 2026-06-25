import { useState } from 'react';

import { IconCalendar, IconMessages, IconStar, IconStarFilled } from '@tabler/icons-react';
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

import { type BoardApplication } from '../types';
import { STAGE_COLOR } from '../utils/stageColors';

type ApplicationCardProps = {
  application: BoardApplication;
  appliedVia: string;
  appliedOn: string;
  sources: ClientMessages['trackerBoard']['sources'];
  favoriteLabels: ClientMessages['trackerBoard']['favorite'];
};

export function ApplicationCard({
  application,
  appliedVia,
  appliedOn,
  sources,
  favoriteLabels,
}: ApplicationCardProps) {
  const { company, role, stage, subStage, tags, source, appliedAt } = application;
  const locale = useLocale();

  // Local-only until the toggleFavorite server action lands (see ADR-0007); the board is not
  // yet wired to real data, so this just flips the visual state for the session.
  const [favorite, setFavorite] = useState(application.favorite);

  // Word order around the source/date differs per locale, so the footer fills a localized
  // template ("Applied via {source} on {date}") rather than concatenating fixed fragments.
  const appliedTemplate = source !== null ? appliedVia : appliedOn;

  // Sub-stage is a stage-bound pipeline chip; it only exists for Active & Final Stages
  // (ADR-0001), so the card never paints it for Applied/Closed cards.
  const showSubStage = (stage === 'active' || stage === 'final_stages') && subStage !== null;

  const favoriteLabel = favorite ? favoriteLabels.remove : favoriteLabels.add;

  return (
    <Card size='sm' className='shrink-0 cursor-pointer rounded-3xl'>
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
              event.stopPropagation(); // the card itself becomes clickable (opens drawer) later
              setFavorite((prev) => !prev);
              // TODO(favorite): call the toggleFavorite server action once the BE lands
              // (todos §2, ADR-0007).
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
}

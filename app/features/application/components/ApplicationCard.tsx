import { IconCalendar, IconMessages } from '@tabler/icons-react';
import { useLocale } from 'next-intl';

import { Badge } from '@/app/components/ui/Badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/Card';
import { Muted, Small } from '@/app/components/ui/Typography';
import { formatDate } from '@/app/lib/formatter/date';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';
import { cn } from '@/app/lib/tailwind/utils';

import { type BoardApplication } from '../types';
import { STAGE_COLOR } from '../utils/stageColors';

type ApplicationCardProps = {
  application: BoardApplication;
  appliedVia: string;
  appliedOn: string;
  sources: ClientMessages['trackerBoard']['sources'];
};

export function ApplicationCard({
  application,
  appliedVia,
  appliedOn,
  sources,
}: ApplicationCardProps) {
  const { company, role, stage, subStage, tags, source, appliedAt } = application;
  const locale = useLocale();

  // Word order around the source/date differs per locale, so the footer fills a localized
  // template ("Applied via {source} on {date}") rather than concatenating fixed fragments.
  const appliedTemplate = source !== null ? appliedVia : appliedOn;

  // Sub-stage is a stage-bound pipeline chip; it only exists for Active & Final Stages
  // (ADR-0001), so the card never paints it for Applied/Closed cards.
  const showSubStage = (stage === 'active' || stage === 'final_stages') && subStage !== null;

  return (
    <Card size='sm' className='shrink-0 cursor-pointer rounded-3xl'>
      <CardHeader>
        <CardTitle className='font-semibold'>{company}</CardTitle>
        <CardDescription className='text-base'>{role}</CardDescription>
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

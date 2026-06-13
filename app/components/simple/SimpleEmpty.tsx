import { type ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/app/components/ui/Empty';
import { cn } from '@/app/lib/tailwind/utils';

import { EmptyIcon } from '../icons/EmptyIcon';

type SimpleEmptyProps = {
  className?: string;
  media?: ReactNode;
  title?: string;
  description?: string;
  content?: ReactNode;
};

export function SimpleEmpty({ media, className, title, description, content }: SimpleEmptyProps) {
  const t = useTranslations('components.simpleEmpty');
  const computedTitle = title ?? t('noData');
  const computedMedia = media ?? (
    <EmptyMedia variant='icon' className={cn(!description && 'mb-0')}>
      <EmptyIcon />
    </EmptyMedia>
  );

  return (
    <Empty className={className}>
      <EmptyHeader>
        {computedMedia}
        <EmptyTitle>{computedTitle}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>

      {content}
    </Empty>
  );
}

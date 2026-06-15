'use client';

import { IconBell } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { SimpleEmpty } from '../../simple/SimpleEmpty';
import { Button } from '../../ui/Button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '../../ui/DropdownMenu';
import { EmptyMedia } from '../../ui/Empty';

function NotificationEmpty() {
  const t = useTranslations('components.notification.empty');

  return (
    <SimpleEmpty
      title={t('title')}
      description={t('description')}
      media={
        <EmptyMedia variant='icon'>
          <IconBell />
        </EmptyMedia>
      }
    />
  );
}

export function NotificationButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size='icon' variant='outline'>
            <IconBell />
          </Button>
        }
      />

      <DropdownMenuContent className='w-80' side='bottom' align='end' sideOffset={4}>
        <NotificationEmpty />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

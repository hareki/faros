import { IconBell } from '@tabler/icons-react';

import { Button } from '../../ui/Button';

export function NotificationButton() {
  return (
    <Button size='icon' variant='outline'>
      <IconBell />
    </Button>
  );
}

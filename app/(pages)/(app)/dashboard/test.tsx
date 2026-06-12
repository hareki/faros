'use client';

import { Button } from '@/app/components/ui/Button';
import { confirm } from '@/app/lib/confirm/confirm';

export default function Test() {
  return (
    <Button
      onClick={() => {
        confirm.destructive({
          onConfirm: () => {
            console.log('test');
          },
        });
        // toast.error('Event has been created', {
        //   description: 'Sunday, December 03, 2023 at 9:00 AM',
        //   action: {
        //     label: 'Undo',
        //     onClick: () => {
        //       console.log('Undo');
        //     },
        //   },
        // });
      }}
    >
      test
    </Button>
  );
}

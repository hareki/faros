'use client';

import { Button } from '@/app/components/ui/Button';
import { toast } from '@/app/lib/sonner/toast';

export default function Test() {
  return (
    <Button
      onClick={() => {
        toast.error('Event has been created', {
          description: 'Sunday, December 03, 2023 at 9:00 AM',
          action: {
            label: 'Undo',
            onClick: () => {
              console.log('Undo');
            },
          },
        });
      }}
    >
      test
    </Button>
  );
}

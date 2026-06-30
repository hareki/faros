'use client';

import { Button } from '@/src/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/Dialog';
import { closedOutcome } from '@/src/features/application/db/schema';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { useCloseApplicationVM } from '../view-models/useCloseApplicationVM';

type CloseOutcomePromptProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  messages: ClientMessages['trackerBoard'];
  onClosed: () => void;
};

/**
 * Dialog that collects one of the four close outcomes (rejected / withdrawn / accepted / ghosted)
 * and calls `closeApplicationAction`. Consumed by the drag-into-Closed flow. Cancel leaves the
 * application unchanged so the caller can revert the drag.
 */
export function CloseOutcomePrompt({
  open,
  onOpenChange,
  applicationId,
  messages,
  onClosed,
}: CloseOutcomePromptProps) {
  const vm = useCloseApplicationVM(messages);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{messages.quickAdd.outcomeLabel}</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-2'>
          {closedOutcome.enumValues.map((outcome) => (
            <Button
              key={outcome}
              variant='outline'
              disabled={vm.isPending}
              onClick={async () => {
                const ok = await vm.close(applicationId, outcome);

                if (ok) {
                  onClosed();
                  onOpenChange(false);
                }
              }}
            >
              {messages.quickAdd.outcomes[outcome]}
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {messages.quickAdd.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

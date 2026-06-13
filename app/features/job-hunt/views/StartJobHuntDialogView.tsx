import { Dialog, DialogContent } from '@/app/components/ui/Dialog';
import { useStartJobHuntVM } from '@/app/features/job-hunt/view-models/useStartJobHuntVM';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { NameJobHuntDialogView } from './NameJobHuntDialogView';

type StartJobHuntFormProps = {
  messages: ClientMessages['layout']['jobHuntDialogs']['start'];
  onSuccess: () => void;
};

function StartJobHuntForm({ messages, onSuccess }: StartJobHuntFormProps) {
  const { control, Form, isPending, onSubmit } = useStartJobHuntVM(messages, onSuccess);

  return (
    <Form onSubmit={onSubmit} className='grid gap-6'>
      <NameJobHuntDialogView control={control} isPending={isPending} messages={messages} />
    </Form>
  );
}

type StartJobHuntDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ClientMessages['layout']['jobHuntDialogs'];
};

export function StartJobHuntDialog({ open, onOpenChange, messages }: StartJobHuntDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <StartJobHuntForm
          messages={messages.start}
          onSuccess={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

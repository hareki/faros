import { Dialog, DialogContent } from '@/src/components/ui/Dialog';
import { type JobHuntSummary } from '@/src/features/job-hunt/types';
import { useRenameJobHuntVM } from '@/src/features/job-hunt/view-models/useRenameJobHuntVM';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { NameJobHuntDialogView } from './NameJobHuntDialogView';

type RenameJobHuntFormProps = {
  messages: ClientMessages['layout']['jobHuntDialogs']['rename'];
  errors: ClientMessages['layout']['jobHuntDialogs']['errors'];
  jobHunt?: JobHuntSummary;
  onSuccess: () => void;
};

function RenameJobHuntForm({ messages, errors, jobHunt, onSuccess }: RenameJobHuntFormProps) {
  const { control, Form, isPending, onSubmit } = useRenameJobHuntVM(messages, errors, {
    jobHunt,
    onSuccess,
  });

  return (
    <Form onSubmit={onSubmit} className='grid gap-6'>
      <NameJobHuntDialogView control={control} isPending={isPending} messages={messages} />
    </Form>
  );
}

type RenameJobHuntDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ClientMessages['layout']['jobHuntDialogs'];
  jobHunt?: JobHuntSummary;
};

export function RenameJobHuntDialogView({
  open,
  onOpenChange,
  messages,
  jobHunt,
}: RenameJobHuntDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <RenameJobHuntForm
          messages={messages.rename}
          errors={messages.errors}
          jobHunt={jobHunt}
          onSuccess={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent } from '@/app/components/ui/Dialog';
import { type SketchJobHunt } from '@/app/features/job-hunt/components/sketchData';
import { useRenameJobHuntVM } from '@/app/features/job-hunt/view-models/useRenameJobHuntVM';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { NameJobHuntDialogView } from './NameJobHuntDialogView';

type RenameJobHuntFormProps = {
  messages: ClientMessages['layout']['jobHuntDialogs']['rename'];
  jobHunt?: SketchJobHunt;
  onSuccess: () => void;
};

function RenameJobHuntForm({ messages, jobHunt, onSuccess }: RenameJobHuntFormProps) {
  const { control, Form, isPending, onSubmit } = useRenameJobHuntVM(messages, {
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
  jobHunt?: SketchJobHunt;
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
          jobHunt={jobHunt}
          onSuccess={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

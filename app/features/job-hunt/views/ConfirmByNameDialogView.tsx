import { Button } from '@/app/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/Dialog';
import { FieldGroup } from '@/app/components/ui/Field';
import { InlineCode, Small } from '@/app/components/ui/Typography';
import { useConfirmByNameVM } from '@/app/features/job-hunt/view-models/useConfirmByNameVM';
import { FormTextField } from '@/app/lib/form/components/FormTextField';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

/** `end` and `delete` share this shape; either may drive the dialog. */
type ConfirmByNameMessages = ClientMessages['layout']['jobHuntDialogs']['end' | 'delete'];

type ConfirmByNameFormProps = {
  /** The exact hunt name the user must retype to unlock the destructive action. */
  jobHuntName: string;
  isPending: boolean;
  onConfirm: () => void;
  messages: ConfirmByNameMessages;
};

function ConfirmByNameForm({
  jobHuntName,
  isPending,
  onConfirm,
  messages,
}: ConfirmByNameFormProps) {
  const { control, Form, confirmed, onSubmit } = useConfirmByNameVM(
    jobHuntName,
    isPending,
    onConfirm,
  );

  const [promptBefore, promptAfter] = messages.confirmPrompt.split('{name}');

  return (
    <Form onSubmit={onSubmit} className='grid gap-6'>
      <DialogHeader>
        <DialogTitle>{messages.title}</DialogTitle>
        <DialogDescription>{messages.description}</DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <FormTextField
          control={control}
          name='name'
          label={
            <Small as='span' className='font-normal text-muted-foreground'>
              {promptBefore}
              <InlineCode>{jobHuntName}</InlineCode>
              {promptAfter}
            </Small>
          }
          inputProps={{
            autoFocus: true,
            autoComplete: 'off',
            placeholder: messages.inputPlaceholder,
          }}
        />
      </FieldGroup>

      <DialogFooter>
        <DialogClose render={<Button variant='outline' />}>{messages.cancel}</DialogClose>
        <Button type='submit' variant='destructive' disabled={!confirmed} loading={isPending}>
          {messages.confirm}
        </Button>
      </DialogFooter>
    </Form>
  );
}

type ConfirmByNameDialogViewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The exact hunt name the user must retype to unlock the destructive action. */
  jobHuntName: string;
  isPending: boolean;
  onConfirm: () => void;
  messages: ConfirmByNameMessages;
};

/**
 * GitHub-style destructive confirmation: the user must type the hunt's exact name before the
 * confirm button enables. Backs both End hunt and Delete hunt, so accidental triggering of
 * either rare-but-irreversible action takes a deliberate step.
 */
export function ConfirmByNameDialogView({
  open,
  onOpenChange,
  jobHuntName,
  isPending,
  onConfirm,
  messages,
}: ConfirmByNameDialogViewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ConfirmByNameForm
          jobHuntName={jobHuntName}
          isPending={isPending}
          onConfirm={onConfirm}
          messages={messages}
        />
      </DialogContent>
    </Dialog>
  );
}

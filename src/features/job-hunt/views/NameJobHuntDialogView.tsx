import { Fragment } from 'react';

import { type Control } from 'react-hook-form';

import { Button } from '@/src/components/ui/Button';
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/Dialog';
import { FieldGroup } from '@/src/components/ui/Field';
import { type JobHuntNameInput } from '@/src/features/job-hunt/schemas/jobHuntName';
import { FormTextField } from '@/src/lib/form/components/FormTextField';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

type DialogMessages = ClientMessages['layout']['jobHuntDialogs'];

type NameJobHuntDialogViewProps = {
  control: Control<JobHuntNameInput>;
  isPending: boolean;
  messages: DialogMessages['start'] | DialogMessages['rename'];
};

/** Shared name-field body for the start/rename dialogs; rendered inside `FormDialog`. */
export function NameJobHuntDialogView({
  control,
  isPending,
  messages,
}: NameJobHuntDialogViewProps) {
  return (
    <Fragment>
      <DialogHeader>
        <DialogTitle>{messages.title}</DialogTitle>
        <DialogDescription>{messages.description}</DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <FormTextField
          control={control}
          name='name'
          label={messages.nameLabel}
          inputProps={{ autoFocus: true, placeholder: messages.namePlaceholder }}
        />
      </FieldGroup>

      <DialogFooter>
        <DialogClose render={<Button variant='outline' />}>{messages.cancel}</DialogClose>
        <Button type='submit' loading={isPending}>
          {messages.confirm}
        </Button>
      </DialogFooter>
    </Fragment>
  );
}

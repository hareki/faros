'use client';

import { useId } from 'react';

import { Controller } from 'react-hook-form';

import { Button } from '@/src/components/ui/Button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/src/components/ui/Combobox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/Dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/Field';
import { closedOutcome } from '@/src/features/application/db/schema';
import { type BoardStage } from '@/src/features/application/types';
import { FormTextField } from '@/src/lib/form/components/FormTextField';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { useCreateApplicationVM } from '../view-models/useCreateApplicationVM';

type ClosedOutcomeValue = (typeof closedOutcome.enumValues)[number];

type QuickAddDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: BoardStage;
  messages: ClientMessages['trackerBoard']['quickAdd'];
};

export function QuickAddDialog({ open, onOpenChange, stage, messages }: QuickAddDialogProps) {
  const outcomeId = useId();
  const { control, Form, isPending, onSubmit } = useCreateApplicationVM(stage, messages, () => {
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form onSubmit={onSubmit} className='grid gap-6'>
          <DialogHeader>
            <DialogTitle>{messages.title}</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <FormTextField control={control} name='company' label={messages.companyLabel} />
            <FormTextField control={control} name='role' label={messages.roleLabel} />

            {stage === 'closed' && (
              <Controller
                control={control}
                name='closedOutcome'
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={outcomeId}>{messages.outcomeLabel}</FieldLabel>
                    <Combobox
                      items={closedOutcome.enumValues}
                      value={field.value}
                      multiple={false}
                      onValueChange={(next: ClosedOutcomeValue | null) => {
                        field.onChange(next);
                      }}
                      itemToStringLabel={(item: ClosedOutcomeValue) => messages.outcomes[item]}
                    >
                      <ComboboxInput
                        id={outcomeId}
                        placeholder={messages.outcomeLabel}
                        aria-invalid={!!fieldState.error}
                        showClear={field.value !== null}
                        onBlur={field.onBlur}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty />
                        <ComboboxList>
                          {(item: ClosedOutcomeValue) => (
                            <ComboboxItem key={item} value={item}>
                              {messages.outcomes[item]}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}
          </FieldGroup>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                onOpenChange(false);
              }}
            >
              {messages.cancel}
            </Button>
            <Button type='submit' loading={isPending}>
              {messages.submit}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

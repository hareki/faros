'use client';

import { useWatch } from 'react-hook-form';

import { type JobHuntNameInput } from '@/app/features/job-hunt/schemas/jobHuntName';
import { useForm } from '@/app/lib/form/hooks/useForm';

export function useConfirmByNameVM(jobHuntName: string, isPending: boolean, onConfirm: () => void) {
  const [{ control }, Form] = useForm<JobHuntNameInput>({
    defaultValues: { name: '' },
  });

  const typedName = useWatch({ control, name: 'name', defaultValue: '' });
  const confirmed = typedName.trim() === jobHuntName;

  const onSubmit = () => {
    if (confirmed && !isPending) {
      onConfirm();
    }
  };

  return { control, Form, confirmed, onSubmit };
}

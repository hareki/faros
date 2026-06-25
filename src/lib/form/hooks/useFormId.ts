import { createContext, use } from 'react';

export const FormIdContext = createContext<string | null>(null);

export function useFormId(): string {
  const id = use(FormIdContext);

  if (id === null) {
    throw new Error('useFormId must be used within a <Form>');
  }

  return id;
}

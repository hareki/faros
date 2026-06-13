'use client';

import { type PropsWithChildren } from 'react';

import { IconMail } from '@tabler/icons-react';

import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { AuthFormWrapperView } from './AuthFormWrapperView';

type CheckEmailViewProps = PropsWithChildren<{
  messages: ClientMessages['auth']['shared'];
  email: string;
}>;

export function CheckEmailView({ messages, email, children }: CheckEmailViewProps) {
  return (
    <AuthFormWrapperView
      messages={messages}
      icon={<IconMail className='size-12' stroke={1.5} />}
      title={messages.checkEmailTitle}
      subtitle={messages.checkEmailSubtitle.replace('{email}', email)}
    >
      {children}
    </AuthFormWrapperView>
  );
}

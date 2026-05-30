'use client';

import { type PropsWithChildren } from 'react';

import { IconMail } from '@tabler/icons-react';
import { type Messages } from 'next-intl';

import AuthFormWrapperView from './AuthFormWrapperView';

type CheckEmailViewProps = PropsWithChildren<{
  messages: Messages['ClientAuthentication'];
  email: string;
}>;

export default function CheckEmailView({ messages, email, children }: CheckEmailViewProps) {
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

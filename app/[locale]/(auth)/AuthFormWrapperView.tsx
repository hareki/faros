'use client';

import { type PropsWithChildren, type ReactNode } from 'react';

import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react';
import { useMessages } from 'next-intl';

import FavIcon from '@/app/components/icons/FavIcon';
import Button from '@/app/components/ui/Button';

export type SocialProvider = 'google' | 'github';

type AuthFormWrapperViewProps = PropsWithChildren<{
  title: ReactNode;
  subtitle: ReactNode;
  footer: ReactNode;
  onSocialClick: (provider: SocialProvider) => void;
}>;

export default function AuthFormWrapperView({
  title,
  subtitle,
  footer,
  onSocialClick,
  children,
}: AuthFormWrapperViewProps) {
  const messages = useMessages().AuthClient;

  return (
    <div className='flex w-full max-w-sm flex-col gap-6'>
      {/* Logo */}
      <div className='flex-center'>
        <FavIcon className='size-12' />
      </div>

      {/* Heading */}
      <div className='flex flex-col gap-2 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
        <p className='text-sm text-muted-foreground'>{subtitle}</p>
      </div>

      {/* Social login */}
      <div className='grid grid-cols-2 gap-3'>
        <Button
          type='button'
          variant='secondary'
          size='lg'
          onClick={() => {
            onSocialClick('google');
          }}
        >
          <IconBrandGoogle />
          {messages.google}
        </Button>
        <Button
          type='button'
          variant='secondary'
          size='lg'
          onClick={() => {
            onSocialClick('github');
          }}
        >
          <IconBrandGithub />
          {messages.github}
        </Button>
      </div>

      {/* Divider */}
      <div className='flex items-center gap-3 text-sm text-muted-foreground'>
        <hr className='flex-1 border-border' />
        <span>{messages.or}</span>
        <hr className='flex-1 border-border' />
      </div>

      {/* Form (input fields + submit button) */}
      {children}

      {/* Legal footer */}
      <p className='text-center text-sm text-muted-foreground'>{footer}</p>
    </div>
  );
}

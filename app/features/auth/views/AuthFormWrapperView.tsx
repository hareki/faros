'use client';

import { type PropsWithChildren, type ReactNode } from 'react';

import { type Messages } from 'next-intl';

import FavIcon from '@/app/components/icons/FavIcon';
import GitHubIcon from '@/app/components/icons/GitHubIcon';
import GoogleIcon from '@/app/components/icons/GoogleIcon';
import Button from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Separator } from '@/app/components/ui/Separator';
import { H3, Muted } from '@/app/components/ui/Typography';

export type SocialProvider = 'google' | 'github';

type AuthFormWrapperViewProps = PropsWithChildren<{
  title: ReactNode;
  subtitle: ReactNode;
  footer: ReactNode;
  onSocialClick: (provider: SocialProvider) => void;
  messages: Messages['ClientAuth'];
}>;

export default function AuthFormWrapperView({
  title,
  subtitle,
  footer,
  onSocialClick,
  children,
  messages,
}: AuthFormWrapperViewProps) {
  return (
    <Card>
      <CardContent>
        <div className='flex w-full max-w-sm flex-col gap-6'>
          {/* Logo */}
          <div className='flex-center'>
            <FavIcon className='size-12' />
          </div>

          {/* Heading */}
          <div className='flex flex-col gap-2 text-center'>
            <H3 as='h1'>{title}</H3>
            <Muted>{subtitle}</Muted>
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
              <GoogleIcon />
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
              <GitHubIcon />
              {messages.github}
            </Button>
          </div>

          {/* Divider */}
          <div className='flex items-center gap-3 text-sm text-muted-foreground'>
            <Separator className='flex-1' />
            <span>{messages.or}</span>
            <Separator className='flex-1' />
          </div>

          {/* Form (input fields + submit button) */}
          {children}

          {/* Legal footer */}
          <Muted className='text-center'>{footer}</Muted>
        </div>
      </CardContent>
    </Card>
  );
}

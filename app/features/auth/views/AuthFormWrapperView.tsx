'use client';

import { Fragment, type PropsWithChildren, type ReactNode, ViewTransition } from 'react';

import { type Messages } from 'next-intl';

import FavIcon from '@/app/components/icons/FavIcon';
import GitHubIcon from '@/app/components/icons/GitHubIcon';
import GoogleIcon from '@/app/components/icons/GoogleIcon';
import Button from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Separator } from '@/app/components/ui/Separator';
import { H3, Muted } from '@/app/components/ui/Typography';
import { cn } from '@/app/lib/tailwind/utils';

export type SocialProvider = 'google' | 'github';

type AuthFormWrapperViewProps = PropsWithChildren<{
  title: ReactNode;
  subtitle: ReactNode;
  footer?: ReactNode;
  // Defaults to the Faros logo; override to swap the icon shown above the heading.
  icon?: ReactNode;
  // Omit to hide the social sign-in section (and its divider) entirely.
  onSocialClick?: (provider: SocialProvider) => void;
  messages: Messages['ClientAuthentication'];
}>;

export default function AuthFormWrapperView({
  title,
  subtitle,
  footer,
  icon = <FavIcon className='size-12' />,
  onSocialClick,
  children,
  messages,
}: AuthFormWrapperViewProps) {
  return (
    <ViewTransition
      name='auth-card'
      // instance is replaced, names match
      share='morph'
      // instance stays, children change
      update='morph'
      default='none'
    >
      <div className='relative'>
        <div
          // https://github.com/tailwindlabs/tailwindcss/discussions/19582#discussioncomment-15683979
          className={cn(`
            absolute inset-0 size-full scale-[0.75] transform rounded-4xl bg-linear-to-r
            from-(--ctp-blue) to-(--ctp-yellow) blur-3xl
          `)}
        />
        <Card className='relative'>
          <CardContent>
            <div className='flex w-full max-w-sm flex-col gap-6'>
              {/* Logo */}
              <div className='flex-center'>{icon}</div>

              {/* Heading */}
              <div className='flex flex-col gap-2 text-center'>
                <H3 as='h1'>{title}</H3>
                <Muted>{subtitle}</Muted>
              </div>

              {onSocialClick && (
                <Fragment>
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
                </Fragment>
              )}

              {/* Form (input fields + submit button) */}
              {children}

              {/* Legal footer */}
              {footer && <Muted className='text-center text-xs'>{footer}</Muted>}
            </div>
          </CardContent>
        </Card>
      </div>
    </ViewTransition>
  );
}

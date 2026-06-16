'use client';

import { useTransition } from 'react';

import { IconLanguage } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/app/components/ui/DropdownMenu';
import { locales, type Locale } from '@/app/lib/next-intl/config';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';
import { setUserLocale } from '@/app/lib/next-intl/utils/locale';

type LocaleSwitcherProps = {
  messages: ClientMessages['layout']['locale'];
};

export function LocaleSwitcher({ messages }: LocaleSwitcherProps) {
  const activeLocale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSelect(locale: Locale) {
    startTransition(async () => {
      await setUserLocale(locale);
      router.refresh();
    });
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <IconLanguage />
        {messages.label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup
          value={activeLocale}
          onValueChange={(value) => {
            onSelect(value as Locale);
          }}
        >
          {locales.map((locale) => (
            <DropdownMenuRadioItem key={locale} value={locale} disabled={isPending}>
              {messages[locale]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

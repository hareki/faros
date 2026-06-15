'use client';
import { IconSearch } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { Input } from '../../ui/Input';
import { InputGroupAddon } from '../../ui/InputGroup';

export function GlobalSearch() {
  const t = useTranslations('components.globalSearch');

  return (
    <Input
      placeholder={t('placeholder')}
      addon={
        <InputGroupAddon align='inline-start'>
          <IconSearch />
        </InputGroupAddon>
      }
    />
  );
}

'use client';
import { IconSearch } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { InputGroup, InputGroupInput, InputGroupAddon } from '../../ui/InputGroup';

export function GlobalSearch() {
  const t = useTranslations('components.globalSearch');

  return (
    <InputGroup>
      <InputGroupInput placeholder={t('placeholder')} />
      <InputGroupAddon align='inline-start'>
        <IconSearch />
      </InputGroupAddon>
    </InputGroup>
  );
}

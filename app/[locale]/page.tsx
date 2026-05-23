import { useTranslations } from 'next-intl';

import LocaleSwitcher from '@/components/ui/LocaleSwitcher';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div>
      <LocaleSwitcher />
      <h1>{t('title')}</h1>
    </div>
  );
}

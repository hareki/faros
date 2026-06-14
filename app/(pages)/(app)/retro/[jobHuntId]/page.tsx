import { getTranslations } from 'next-intl/server';

import { SimpleEmpty } from '@/app/components/simple/SimpleEmpty';

// Placeholder Retro surface so the hunt switcher can link ended hunts (typed route).
// The real review (funnel, time stats, source/resume performance) lands with feature #7.
export default async function RetroPage() {
  const t = await getTranslations('retro');

  return (
    <SimpleEmpty
      className='flex-1'
      title={t('comingSoonTitle')}
      description={t('comingSoonDescription')}
    />
  );
}

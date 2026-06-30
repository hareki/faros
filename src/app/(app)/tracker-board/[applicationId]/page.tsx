import { Suspense } from 'react';

import { ApplicationDetail } from '@/src/features/application/components/ApplicationDetail';
import { ApplicationDetailSkeleton } from '@/src/features/application/components/ApplicationDetailSkeleton';

type ApplicationDetailPageProps = { params: Promise<{ applicationId: string }> };

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { applicationId } = await params;

  return (
    <Suspense fallback={<ApplicationDetailSkeleton />}>
      <ApplicationDetail applicationId={applicationId} variant='page' />
    </Suspense>
  );
}

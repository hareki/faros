import { Suspense } from 'react';

import { ApplicationDetail } from '@/src/features/application/components/ApplicationDetail';
import { ApplicationDetailModal } from '@/src/features/application/components/ApplicationDetailModal';
import { ApplicationDetailSkeleton } from '@/src/features/application/components/ApplicationDetailSkeleton';

type InterceptedDetailProps = { params: Promise<{ applicationId: string }> };

export default async function InterceptedApplicationDetail({ params }: InterceptedDetailProps) {
  const { applicationId } = await params;

  return (
    <ApplicationDetailModal>
      <Suspense fallback={<ApplicationDetailSkeleton />}>
        <ApplicationDetail applicationId={applicationId} variant='modal' />
      </Suspense>
    </ApplicationDetailModal>
  );
}

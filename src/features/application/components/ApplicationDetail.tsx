import { notFound } from 'next/navigation';

import { db } from '@/src/db/client';
import {
  getApplicationActivity,
  getApplicationDetail,
  listSubStages,
  listTags,
} from '@/src/features/application/db/queries';
import { ApplicationDetailView } from '@/src/features/application/views/ApplicationDetailView';
import { requireUser } from '@/src/lib/better-auth/session';
import { getClientMessages } from '@/src/lib/next-intl/utils/getClientMessages';

type ApplicationDetailProps = { applicationId: string; variant: 'modal' | 'page' };

/**
 * Server-fetches one application's full detail (after an ownership check), its activity
 * timeline, and the user's sub-stages/tags for the pickers, then hands typed props to the
 * client editing view. Rendered inside a Suspense boundary so the modal/page streams a skeleton
 * while this resolves.
 */
export async function ApplicationDetail({ applicationId, variant }: ApplicationDetailProps) {
  const user = await requireUser();
  const detail = await getApplicationDetail(db, user.id, applicationId);

  if (!detail) {
    notFound();
  }

  const [activity, subStages, tags, messages] = await Promise.all([
    getApplicationActivity(db, applicationId),
    listSubStages(db, user.id),
    listTags(db, user.id),
    getClientMessages(),
  ]);

  return (
    <ApplicationDetailView
      variant={variant}
      detail={detail}
      activity={activity}
      subStages={subStages}
      tags={tags}
      messages={messages.applicationDetail}
      activityMessages={messages.activity}
      sourceMessages={messages.trackerBoard.sources}
      favoriteLabels={messages.trackerBoard.favorite}
    />
  );
}

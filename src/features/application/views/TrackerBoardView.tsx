'use client';

import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { BoardColumn } from '../components/BoardColumn';
import { type SubStageRow, type TagRow } from '../db/queries';
import { BOARD_STAGES, type BoardApplication } from '../types';

type TrackerBoardViewProps = {
  messages: ClientMessages['trackerBoard'];
  applications: BoardApplication[];
  jobHuntId: string | null;
  readOnly: boolean;
  subStages: SubStageRow[];
  tags: TagRow[];
};

export function TrackerBoardView({ messages, applications, jobHuntId }: TrackerBoardViewProps) {
  return (
    <div className='flex flex-1 items-start gap-4 overflow-x-auto overflow-y-hidden'>
      {BOARD_STAGES.map((stage) => (
        <BoardColumn
          key={stage}
          stage={stage}
          label={messages.stages[stage]}
          addLabel={messages.addApplication}
          emptyTitle={messages.empty.title}
          appliedVia={messages.appliedVia}
          appliedOn={messages.appliedOn}
          sources={messages.sources}
          favoriteLabels={messages.favorite}
          applications={applications.filter((application) => application.stage === stage)}
          jobHuntId={jobHuntId}
        />
      ))}
    </div>
  );
}

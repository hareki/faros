'use client';

import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { BoardColumn } from '../components/BoardColumn';
import { BOARD_STAGES, type BoardApplication } from '../types';

type TrackerBoardViewProps = {
  messages: ClientMessages['trackerBoard'];
  applications: BoardApplication[];
};

export function TrackerBoardView({ messages, applications }: TrackerBoardViewProps) {
  return (
    <div className='flex flex-1 items-start gap-4 overflow-x-auto overflow-y-hidden'>
      {BOARD_STAGES.map((stage) => (
        <BoardColumn
          key={stage}
          stage={stage}
          label={messages.stages[stage]}
          addLabel={messages.addApplication}
          emptyTitle={messages.empty.title}
          applications={applications.filter((application) => application.stage === stage)}
        />
      ))}
    </div>
  );
}

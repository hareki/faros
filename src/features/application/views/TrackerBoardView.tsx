'use client';

import { DragDropProvider } from '@dnd-kit/react';

import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { CloseOutcomePrompt } from './CloseOutcomePrompt';
import { BoardColumn } from '../components/BoardColumn';
import { BoardFilterBar } from '../components/BoardFilterBar';
import { type SubStageRow, type TagRow } from '../db/queries';
import { BOARD_STAGES, type BoardApplication } from '../types';
import { useBoardDndVM } from '../view-models/useBoardDndVM';

type TrackerBoardViewProps = {
  messages: ClientMessages['trackerBoard'];
  applications: BoardApplication[];
  jobHuntId: string | null;
  readOnly: boolean;
  subStages: SubStageRow[];
  tags: TagRow[];
};

export function TrackerBoardView({
  messages,
  applications,
  jobHuntId,
  readOnly,
  subStages,
  tags,
}: TrackerBoardViewProps) {
  const vm = useBoardDndVM(applications, messages);

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <BoardFilterBar subStages={subStages} tags={tags} messages={messages} />
      <DragDropProvider onDragEnd={vm.onDragEnd}>
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
              applications={vm.applications.filter((application) => application.stage === stage)}
              jobHuntId={jobHuntId}
              readOnly={readOnly}
              quickAddMessages={messages.quickAdd}
            />
          ))}
        </div>
      </DragDropProvider>

      <CloseOutcomePrompt
        open={vm.pendingClose !== null}
        onOpenChange={(open) => {
          if (!open) {
            vm.clearPendingClose();
          }
        }}
        applicationId={vm.pendingClose?.applicationId ?? ''}
        messages={messages}
        onClosed={vm.clearPendingClose}
      />
    </div>
  );
}

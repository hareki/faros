'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { H3, H4, Muted } from '@/src/components/ui/Typography';
import { type SubStageRow as SubStageRecord } from '@/src/features/application/db/queries';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { SubStageRow } from '../components/SubStageRow';
import { useSubStageCrudVM } from '../view-models/useSubStageCrudVM';

type SubStageMessages = ClientMessages['settings']['subStages'];
type Stage = 'active' | 'final_stages';

const SUB_STAGE_STAGES: Stage[] = ['active', 'final_stages'];

type SubStagesViewProps = {
  messages: SubStageMessages;
  subStages: SubStageRecord[];
};

export function SubStagesView({ messages, subStages }: SubStagesViewProps) {
  const vm = useSubStageCrudVM(messages);

  const [addingStage, setAddingStage] = useState<Stage | null>(null);
  const [addName, setAddName] = useState('');

  const handleStartAdd = (stage: Stage) => {
    setAddingStage(stage);
    setAddName('');
  };

  const handleCancelAdd = () => {
    setAddingStage(null);
    setAddName('');
  };

  const handleCreate = async (stage: Stage) => {
    const success = await vm.create(stage, addName);

    if (success) {
      setAddingStage(null);
      setAddName('');
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      <div>
        <H3>{messages.title}</H3>
        <Muted as='p'>{messages.description}</Muted>
      </div>
      <div
        className='
          grid gap-8
          sm:grid-cols-2
        '
      >
        {SUB_STAGE_STAGES.map((stage) => {
          const stageSubStages = subStages.filter((ss) => ss.stage === stage);

          return (
            <section key={stage} className='flex flex-col gap-3'>
              <H4>{messages.stages[stage]}</H4>
              <div className='flex flex-col gap-2'>
                {stageSubStages.length === 0 ? (
                  <Muted as='p'>{messages.empty}</Muted>
                ) : (
                  stageSubStages.map((ss) => (
                    <SubStageRow key={ss.id} subStage={ss} vm={vm} messages={messages} />
                  ))
                )}
              </div>
              {addingStage === stage ? (
                <div className='flex items-center gap-2'>
                  <Input
                    value={addName}
                    onChange={(e) => {
                      setAddName(e.target.value);
                    }}
                    placeholder={messages.namePlaceholder}
                    disabled={vm.isPending}
                    autoFocus
                    className='flex-1'
                  />
                  <Button
                    size='sm'
                    onClick={() => handleCreate(stage)}
                    disabled={vm.isPending || !addName.trim()}
                    loading={vm.isPending}
                  >
                    {messages.save}
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={handleCancelAdd}
                    disabled={vm.isPending}
                  >
                    {messages.cancel}
                  </Button>
                </div>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  className='self-start'
                  onClick={() => {
                    handleStartAdd(stage);
                  }}
                  disabled={vm.isPending}
                >
                  {messages.addLabel}
                </Button>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

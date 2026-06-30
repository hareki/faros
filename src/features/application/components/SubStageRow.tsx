'use client';

import { useState } from 'react';

import { useSortable } from '@dnd-kit/react/sortable';
import { IconGripVertical } from '@tabler/icons-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/AlertDialog';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Small } from '@/src/components/ui/Typography';
import { type SubStageRow as SubStageRecord } from '@/src/features/application/db/queries';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { type useSubStageCrudVM } from '../view-models/useSubStageCrudVM';

type SubStageMessages = ClientMessages['settings']['subStages'];

type SubStageRowProps = {
  subStage: SubStageRecord;
  vm: ReturnType<typeof useSubStageCrudVM>;
  messages: SubStageMessages;
  index: number;
  stage: 'active' | 'final_stages';
};

export function SubStageRow({ subStage, vm, messages, index, stage }: SubStageRowProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: subStage.id,
    index,
    group: stage,
  });

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(subStage.name);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleRenameStart = () => {
    setRenameValue(subStage.name);
    setIsRenaming(true);
  };

  const handleRenameSubmit = async () => {
    const success = await vm.rename(subStage.id, renameValue.trim());

    if (success) {
      setIsRenaming(false);
    }
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    const success = await vm.remove(subStage.id);

    if (success) {
      setIsDeleteOpen(false);
    }
  };

  const handleDeleteOpenChange = (open: boolean) => {
    if (vm.isPending) {
      return;
    }

    setIsDeleteOpen(open);
  };

  return (
    <div
      ref={ref}
      className={`
        flex items-center gap-2 rounded-lg border px-3 py-2
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <button
        ref={handleRef}
        type='button'
        className='cursor-grab touch-none text-muted-foreground'
        aria-label='Drag to reorder'
      >
        <IconGripVertical className='size-4' />
      </button>

      {isRenaming ? (
        <Input
          value={renameValue}
          onChange={(e) => {
            setRenameValue(e.target.value);
          }}
          placeholder={messages.namePlaceholder}
          disabled={vm.isPending}
          autoFocus
          className='flex-1'
        />
      ) : (
        <Small as='span' className='flex-1'>
          {subStage.name}
        </Small>
      )}

      {isRenaming ? (
        <Button
          size='sm'
          onClick={handleRenameSubmit}
          disabled={vm.isPending || !renameValue.trim()}
          loading={vm.isPending}
        >
          {messages.save}
        </Button>
      ) : (
        <Button size='sm' variant='outline' onClick={handleRenameStart} disabled={vm.isPending}>
          {messages.rename}
        </Button>
      )}

      {isRenaming ? (
        <Button size='sm' variant='outline' onClick={handleRenameCancel} disabled={vm.isPending}>
          {messages.cancel}
        </Button>
      ) : (
        <Button
          size='sm'
          variant='outline'
          onClick={() => {
            setIsDeleteOpen(true);
          }}
          disabled={vm.isPending}
        >
          {messages.delete}
        </Button>
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{messages.delete}</AlertDialogTitle>
            <AlertDialogDescription>{messages.deleteConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={vm.isPending}>{messages.cancel}</AlertDialogCancel>
            <AlertDialogAction variant='destructive' loading={vm.isPending} onClick={handleDelete}>
              {messages.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

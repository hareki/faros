'use client';

import React, { useState } from 'react';

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
};

export function SubStageRow({ subStage, vm, messages }: SubStageRowProps) {
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
    <div className='flex items-center gap-2 rounded-lg border px-3 py-2'>
      {isRenaming ? (
        <React.Fragment>
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
          <Button
            size='sm'
            onClick={handleRenameSubmit}
            disabled={vm.isPending || !renameValue.trim()}
            loading={vm.isPending}
          >
            {messages.save}
          </Button>
          <Button size='sm' variant='outline' onClick={handleRenameCancel} disabled={vm.isPending}>
            {messages.cancel}
          </Button>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Small as='span' className='flex-1'>
            {subStage.name}
          </Small>
          <Button size='sm' variant='outline' onClick={handleRenameStart} disabled={vm.isPending}>
            {messages.rename}
          </Button>
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
        </React.Fragment>
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

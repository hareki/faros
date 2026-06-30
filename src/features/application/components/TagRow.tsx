'use client';

import { useState } from 'react';

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
import { type TagRow as TagRecord } from '@/src/features/application/db/queries';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { cn } from '@/src/lib/tailwind/utils';

import { type useTagCrudVM } from '../view-models/useTagCrudVM';

type TagMessages = ClientMessages['settings']['tags'];

type TagRowProps = {
  tag: TagRecord;
  vm: ReturnType<typeof useTagCrudVM>;
  messages: TagMessages;
};

export function TagRow({ tag, vm, messages }: TagRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tag.name);
  const [editColor, setEditColor] = useState(tag.color ?? '#000000');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEditStart = () => {
    setEditName(tag.name);
    setEditColor(tag.color ?? '#000000');
    setIsEditing(true);
  };

  const handleEditSubmit = async () => {
    const success = await vm.update(tag.id, editName.trim(), editColor);

    if (success) {
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const success = await vm.remove(tag.id);

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
      <span
        className={cn('size-4 shrink-0 rounded-sm', !tag.color && 'bg-muted-foreground')}
        style={tag.color ? { backgroundColor: tag.color } : undefined}
      />

      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => {
            setEditName(e.target.value);
          }}
          placeholder={messages.namePlaceholder}
          disabled={vm.isPending}
          autoFocus
          className='flex-1'
        />
      ) : (
        <Small as='span' className='flex-1'>
          {tag.name}
        </Small>
      )}

      {isEditing && (
        <input
          type='color'
          value={editColor}
          onChange={(e) => {
            setEditColor(e.target.value);
          }}
          disabled={vm.isPending}
          aria-label={messages.colorLabel}
          className='size-8 shrink-0 cursor-pointer rounded-sm border p-0.5'
        />
      )}

      {isEditing ? (
        <Button
          size='sm'
          onClick={handleEditSubmit}
          disabled={vm.isPending || !editName.trim()}
          loading={vm.isPending}
        >
          {messages.save}
        </Button>
      ) : (
        <Button size='sm' variant='outline' onClick={handleEditStart} disabled={vm.isPending}>
          {messages.rename}
        </Button>
      )}

      {isEditing ? (
        <Button size='sm' variant='outline' onClick={handleEditCancel} disabled={vm.isPending}>
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

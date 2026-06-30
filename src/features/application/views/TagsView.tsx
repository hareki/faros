'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { H3, Muted } from '@/src/components/ui/Typography';
import { type TagRow as TagRecord } from '@/src/features/application/db/queries';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { TagRow } from '../components/TagRow';
import { useTagCrudVM } from '../view-models/useTagCrudVM';

type TagMessages = ClientMessages['settings']['tags'];

type TagsViewProps = {
  messages: TagMessages;
  tags: TagRecord[];
};

export function TagsView({ messages, tags }: TagsViewProps) {
  const vm = useTagCrudVM(messages);

  const [addName, setAddName] = useState('');
  const [addColor, setAddColor] = useState('#6366f1');

  const handleCreate = async () => {
    const success = await vm.create(addName.trim(), addColor);

    if (success) {
      setAddName('');
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      <div>
        <H3>{messages.title}</H3>
        <Muted as='p'>{messages.description}</Muted>
      </div>
      <div className='flex flex-col gap-2'>
        {tags.length === 0 ? (
          <Muted as='p'>{messages.empty}</Muted>
        ) : (
          tags.map((tag) => <TagRow key={tag.id} tag={tag} vm={vm} messages={messages} />)
        )}
      </div>
      <div className='flex items-center gap-2'>
        <Input
          value={addName}
          onChange={(e) => {
            setAddName(e.target.value);
          }}
          placeholder={messages.namePlaceholder}
          disabled={vm.isPending}
          className='flex-1'
        />
        <input
          type='color'
          value={addColor}
          onChange={(e) => {
            setAddColor(e.target.value);
          }}
          disabled={vm.isPending}
          aria-label={messages.colorLabel}
          className='size-8 shrink-0 cursor-pointer rounded-sm border p-0.5'
        />
        <Button
          size='sm'
          onClick={handleCreate}
          disabled={vm.isPending || !addName.trim()}
          loading={vm.isPending}
        >
          {messages.addLabel}
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useId, useRef, useState } from 'react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from '@/src/components/ui/Combobox';
import { Field, FieldLabel } from '@/src/components/ui/Field';
import { type ApplicationDetail, type TagRow } from '@/src/features/application/db/queries';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { useSetTagsVM } from '../view-models/useSetTagsVM';

type TagPickerProps = {
  detail: ApplicationDetail;
  tags: TagRow[];
  messages: ClientMessages['applicationDetail'];
  readOnly: boolean;
};

/**
 * Multi-select tag picker for the application detail view.
 * Commits immediately via `setTagsAction`; optimistically updates local state
 * and reverts on error.
 */
export function TagPicker({ detail, tags, messages, readOnly }: TagPickerProps) {
  const inputId = useId();
  const vm = useSetTagsVM(detail, messages);
  const chipsRef = useRef<HTMLDivElement | null>(null);

  const [localTagIds, setLocalTagIds] = useState<string[]>(detail.tagIds);

  // Re-seed when the server data changes (after a refresh).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalTagIds(detail.tagIds);
  }, [detail.tagIds]);

  const selectedTags = tags.filter((t) => localTagIds.includes(t.id));

  const handleChange = async (nextTags: TagRow[]) => {
    const nextIds = nextTags.map((t) => t.id);
    const prevIds = localTagIds;

    setLocalTagIds(nextIds);

    const ok = await vm.set(nextIds);

    if (!ok) {
      setLocalTagIds(prevIds);
    }
  };

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>{messages.tags.label}</FieldLabel>
      <Combobox
        items={tags}
        value={selectedTags}
        multiple
        onValueChange={handleChange}
        itemToStringLabel={(tag: TagRow) => tag.name}
        isItemEqualToValue={(a: TagRow, b: TagRow) => a.id === b.id}
        disabled={readOnly || vm.isPending}
      >
        <ComboboxChips ref={chipsRef}>
          {selectedTags.map((tag) => (
            <ComboboxChip key={tag.id}>{tag.name}</ComboboxChip>
          ))}
          <ComboboxChipsInput
            id={inputId}
            placeholder={selectedTags.length === 0 ? messages.tags.placeholder : undefined}
            disabled={readOnly || vm.isPending}
          />
        </ComboboxChips>
        <ComboboxContent anchor={chipsRef}>
          <ComboboxEmpty />
          <ComboboxList>
            {(tag: TagRow) => (
              <ComboboxItem key={tag.id} value={tag}>
                {tag.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

'use client';

import { useId, useRef } from 'react';

import { useQueryStates } from 'nuqs';

import { Button } from '@/src/components/ui/Button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/src/components/ui/Combobox';
import { Field, FieldLabel } from '@/src/components/ui/Field';
import { type SubStageRow, type TagRow } from '@/src/features/application/db/queries';
import {
  APPLICATION_SOURCES,
  type ApplicationSource,
  WORKING_MODELS,
  type WorkingModel,
} from '@/src/features/application/types';
import { boardFilterParsers } from '@/src/features/application/utils/boardFilters';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

type BoardFilterBarProps = {
  subStages: SubStageRow[];
  tags: TagRow[];
  messages: ClientMessages['trackerBoard'];
};

/**
 * Horizontal filter bar for the tracker board. Reads and writes the four
 * board filters (tags, sub-stage, source, working model) as URL search params
 * via nuqs, so each change re-renders the server board with the narrowed query.
 */
export function BoardFilterBar({ subStages, tags, messages }: BoardFilterBarProps) {
  const [filters, setFilters] = useQueryStates(boardFilterParsers, { shallow: false });

  const tagsInputId = useId();
  const subStageInputId = useId();
  const sourceInputId = useId();
  const workingModelInputId = useId();
  const chipsRef = useRef<HTMLDivElement | null>(null);

  const selectedTags = tags.filter((t) => filters.tagIds.includes(t.id));
  const selectedSubStage = subStages.find((s) => s.id === filters.subStageId) ?? null;

  const hasActiveFilters =
    filters.tagIds.length > 0 ||
    filters.subStageId !== null ||
    filters.source !== null ||
    filters.workingModel !== null;

  return (
    <div className='flex shrink-0 flex-wrap items-end gap-3 p-2'>
      <Field>
        <FieldLabel htmlFor={tagsInputId}>{messages.filters.tags}</FieldLabel>
        <Combobox
          items={tags}
          value={selectedTags}
          multiple
          onValueChange={(nextTags: TagRow[]) => {
            void setFilters({ tagIds: nextTags.map((t) => t.id) });
          }}
          itemToStringLabel={(tag: TagRow) => tag.name}
          isItemEqualToValue={(a: TagRow, b: TagRow) => a.id === b.id}
        >
          <ComboboxChips ref={chipsRef}>
            {selectedTags.map((tag) => (
              <ComboboxChip key={tag.id}>{tag.name}</ComboboxChip>
            ))}
            <ComboboxChipsInput
              id={tagsInputId}
              placeholder={selectedTags.length === 0 ? messages.filters.tags : undefined}
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

      <Field>
        <FieldLabel htmlFor={subStageInputId}>{messages.filters.subStage}</FieldLabel>
        <Combobox
          items={subStages}
          value={selectedSubStage}
          multiple={false}
          onValueChange={(next: SubStageRow | null) => {
            void setFilters({ subStageId: next?.id ?? null });
          }}
          itemToStringLabel={(item: SubStageRow) => item.name}
          isItemEqualToValue={(a: SubStageRow, b: SubStageRow) => a.id === b.id}
        >
          <ComboboxInput
            id={subStageInputId}
            placeholder={messages.filters.all}
            showClear={filters.subStageId !== null}
          />
          <ComboboxContent>
            <ComboboxEmpty />
            <ComboboxList>
              {(item: SubStageRow) => (
                <ComboboxItem key={item.id} value={item}>
                  {item.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>

      <Field>
        <FieldLabel htmlFor={sourceInputId}>{messages.filters.source}</FieldLabel>
        <Combobox
          items={APPLICATION_SOURCES}
          value={filters.source}
          multiple={false}
          onValueChange={(next: ApplicationSource | null) => {
            void setFilters({ source: next });
          }}
          itemToStringLabel={(item: ApplicationSource) => messages.sources[item]}
        >
          <ComboboxInput
            id={sourceInputId}
            placeholder={messages.filters.all}
            showClear={filters.source !== null}
          />
          <ComboboxContent>
            <ComboboxEmpty />
            <ComboboxList>
              {(item: ApplicationSource) => (
                <ComboboxItem key={item} value={item}>
                  {messages.sources[item]}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>

      <Field>
        <FieldLabel htmlFor={workingModelInputId}>{messages.filters.workingModel}</FieldLabel>
        <Combobox
          items={WORKING_MODELS}
          value={filters.workingModel}
          multiple={false}
          onValueChange={(next: WorkingModel | null) => {
            void setFilters({ workingModel: next });
          }}
          itemToStringLabel={(item: WorkingModel) => messages.workingModels[item]}
        >
          <ComboboxInput
            id={workingModelInputId}
            placeholder={messages.filters.all}
            showClear={filters.workingModel !== null}
          />
          <ComboboxContent>
            <ComboboxEmpty />
            <ComboboxList>
              {(item: WorkingModel) => (
                <ComboboxItem key={item} value={item}>
                  {messages.workingModels[item]}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>

      {hasActiveFilters && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            void setFilters(null);
          }}
        >
          {messages.filters.clear}
        </Button>
      )}
    </div>
  );
}

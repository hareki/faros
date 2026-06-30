'use client';

import { useEffect, useId, useState } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/src/components/ui/Combobox';
import { Field, FieldLabel } from '@/src/components/ui/Field';
import { type ApplicationDetail, type SubStageRow } from '@/src/features/application/db/queries';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { useSetSubStageVM } from '../view-models/useSetSubStageVM';

// Sub-stages only exist for these two board stages.
const PICKER_STAGES = new Set<string>(['active', 'final_stages']);

// The noneOption sentinel uses id='' (empty string is falsy, distinct from any real UUID).
// Converts a selection to the nullable id for the action: empty id and null both become null.
function pickSubStageId(item: SubStageRow | null): string | null {
  return item?.id || null;
}

type SubStagePickerProps = {
  detail: ApplicationDetail;
  subStages: SubStageRow[];
  messages: ClientMessages['applicationDetail'];
  readOnly: boolean;
};

/**
 * Single-select sub-stage picker for the application detail view.
 * Renders nothing unless `detail.stage` is `'active'` or `'final_stages'`.
 * Commits immediately via `setSubStageAction`; optimistically updates local state
 * and reverts on error.
 */
export function SubStagePicker({ detail, subStages, messages, readOnly }: SubStagePickerProps) {
  const id = useId();
  const vm = useSetSubStageVM(detail, messages);

  const [localSelection, setLocalSelection] = useState<SubStageRow | null>(
    () => subStages.find((s) => s.id === detail.subStageId) ?? null,
  );

  // Re-seed when the server data changes (after a refresh).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSelection(subStages.find((s) => s.id === detail.subStageId) ?? null);
  }, [detail.subStageId, subStages]);

  if (!PICKER_STAGES.has(detail.stage)) {
    return null;
  }

  const filteredSubStages = subStages.filter((s) => s.stage === detail.stage);

  // Sentinel item at the top of the list — selecting it clears the sub-stage.
  const noneOption: SubStageRow = {
    id: '',
    stage: detail.stage,
    name: messages.subStage.none,
    sortOrder: -1,
  };

  const allItems: SubStageRow[] = [noneOption, ...filteredSubStages];

  const handleChange = async (next: SubStageRow | null) => {
    const nextId = pickSubStageId(next);
    const prev = localSelection;

    setLocalSelection(nextId ? next : null);
    const ok = await vm.set(nextId);

    if (!ok) {
      setLocalSelection(prev);
    }
  };

  return (
    <Field>
      <FieldLabel htmlFor={id}>{messages.subStage.label}</FieldLabel>
      <Combobox
        items={allItems}
        value={localSelection}
        multiple={false}
        onValueChange={handleChange}
        itemToStringLabel={(item: SubStageRow) => item.name}
        isItemEqualToValue={(a: SubStageRow, b: SubStageRow) => a.id === b.id}
        disabled={readOnly || vm.isPending}
      >
        <ComboboxInput
          id={id}
          placeholder={messages.subStage.placeholder}
          disabled={readOnly || vm.isPending}
        />
        <ComboboxContent>
          <ComboboxEmpty />
          <ComboboxList>
            {(item: SubStageRow) => (
              <ComboboxItem key={item.id || 'none'} value={item}>
                {item.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

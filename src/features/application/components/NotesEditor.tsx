'use client';

import { useEffect } from 'react';

import { INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode } from '@lexical/list';
import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { IconBold, IconItalic, IconList, IconUnderline } from '@tabler/icons-react';
import { $getRoot, FORMAT_TEXT_COMMAND, type EditorState, type TextFormatType } from 'lexical';

import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/tailwind/utils';

type NotesEditorProps = {
  /** Serialized Lexical editor-state JSON, or `null` when there is no note yet. */
  value: string | null;
  /** Emits the serialized editor state, or `null` when the editor is empty. */
  onChange: (next: string | null) => void;
  readOnly: boolean;
};

const NOTES_NAMESPACE = 'application-notes';

/**
 * Controlled Lexical rich-text editor for application notes. Seeds its state from `value`
 * on mount and reports changes via `onChange`, emitting `null` for an empty document so the
 * `updateApplication` `note_added` (empty => non-empty) activity rule stays correct.
 */
export function NotesEditor({ value, onChange, readOnly }: NotesEditorProps) {
  const initialConfig: InitialConfigType = {
    namespace: NOTES_NAMESPACE,
    nodes: [ListNode, ListItemNode],
    editable: !readOnly,
    // `value` is `null` when there is no note: omit `editorState` so Lexical seeds a default
    // empty paragraph rather than trying to parse `null`.
    editorState: value ?? undefined,
    onError: (error) => {
      throw error;
    },
  };

  const handleChange = (editorState: EditorState) => {
    const text = editorState.read(() => $getRoot().getTextContent().trim());

    if (text === '') {
      onChange(null);

      return;
    }

    onChange(JSON.stringify(editorState.toJSON()));
  };

  return (
    <div
      className={cn(
        `
          overflow-hidden rounded-2xl border border-transparent bg-input/50
          focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30
        `,
        readOnly && 'opacity-50',
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <NotesToolbar readOnly={readOnly} />

        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={cn(`
                min-h-24 px-3 py-2 text-sm/relaxed outline-none
                [&_ul]:list-disc [&_ul]:pl-5
              `)}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <HistoryPlugin />
        <ListPlugin />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        <EditablePlugin editable={!readOnly} />
      </LexicalComposer>
    </div>
  );
}

type NotesToolbarProps = {
  readOnly: boolean;
};

function NotesToolbar({ readOnly }: NotesToolbarProps) {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <div className='flex items-center gap-0.5 border-b border-border/60 p-1'>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        disabled={readOnly}
        aria-label='Bold'
        onClick={() => {
          formatText('bold');
        }}
      >
        <IconBold />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        disabled={readOnly}
        aria-label='Italic'
        onClick={() => {
          formatText('italic');
        }}
      >
        <IconItalic />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        disabled={readOnly}
        aria-label='Underline'
        onClick={() => {
          formatText('underline');
        }}
      >
        <IconUnderline />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        disabled={readOnly}
        aria-label='Bulleted list'
        onClick={() => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }}
      >
        <IconList />
      </Button>
    </div>
  );
}

type EditablePluginProps = {
  editable: boolean;
};

// Keeps the editor's editable state in sync if `readOnly` changes after mount
// (initialConfig.editable is only read once).
function EditablePlugin({ editable }: EditablePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);

  return null;
}

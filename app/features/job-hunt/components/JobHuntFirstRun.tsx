'use client';

import { Fragment, useState } from 'react';

import { IconBriefcase, IconPlus } from '@tabler/icons-react';

import { SimpleEmpty } from '@/app/components/simple/SimpleEmpty';
import { Button } from '@/app/components/ui/Button';
import { EmptyContent, EmptyMedia } from '@/app/components/ui/Empty';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { StartJobHuntDialog } from '../views/StartJobHuntDialogView';

type JobHuntFirstRunProps = {
  messages: ClientMessages['layout']['jobHuntFirstRun'];
  dialogMessages: ClientMessages['layout']['jobHuntDialogs'];
};

/** Focused first-run CTA shown in the main area when the user has no active hunt. */
export function JobHuntFirstRun({ messages, dialogMessages }: JobHuntFirstRunProps) {
  const [startOpen, setStartOpen] = useState(false);

  return (
    <Fragment>
      <SimpleEmpty
        title={messages.title}
        description={messages.description}
        media={
          <EmptyMedia variant='icon'>
            <IconBriefcase />
          </EmptyMedia>
        }
        content={
          <EmptyContent>
            <Button
              onClick={() => {
                setStartOpen(true);
              }}
            >
              <IconPlus />
              {messages.cta}
            </Button>
          </EmptyContent>
        }
      />

      <StartJobHuntDialog open={startOpen} onOpenChange={setStartOpen} messages={dialogMessages} />
    </Fragment>
  );
}

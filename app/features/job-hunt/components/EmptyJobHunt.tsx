'use client';

import { Fragment, useState } from 'react';

import { IconBriefcase, IconPlus } from '@tabler/icons-react';

import { SimpleEmpty } from '@/app/components/simple/SimpleEmpty';
import { Button } from '@/app/components/ui/Button';
import { EmptyContent, EmptyMedia } from '@/app/components/ui/Empty';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { StartJobHuntDialog } from '../views/StartJobHuntDialogView';

type EmptyJobHuntProps = {
  messages: ClientMessages['layout']['jobHuntEmpty'];
  dialogMessages: ClientMessages['layout']['jobHuntDialogs'];
};

/** Focused empty job hunt CTA shown in the main area when the user has no active hunt. */
export function EmptyJobHunt({ messages, dialogMessages }: EmptyJobHuntProps) {
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

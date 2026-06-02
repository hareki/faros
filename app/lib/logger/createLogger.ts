// Isomorphic logger factory. The server and client entrypoints both build their
// logger from here, differing only in `runtime` + `pretty`. This is also the
// single place a future transport (e.g. Sentry) hooks in — add it inside `emit`
// and every call site benefits without changing.

import { formatEntry, normalizeError } from './format';
import { type LogEntry, type LogInput, type LogLevel, type LogRuntime, type Logger } from './types';

type CreateLoggerOptions = {
  runtime: LogRuntime;
  pretty: boolean;
};

export function createLogger({ runtime, pretty }: CreateLoggerOptions): Logger {
  function emit(level: LogLevel, input: LogInput): void {
    const entry: LogEntry = {
      level,
      message: input.message,
      source: input.source,
      runtime,
      timestamp: new Date().toISOString(),
      context: input.context,
      error: normalizeError(input.error),
    };

    const line = formatEntry(entry, pretty);

    // TODO(logger): forward `entry` to Sentry / an aggregator here when added.
    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.info(line);
    }
  }

  return {
    error: (input) => {
      emit('error', input);
    },
    warn: (input) => {
      emit('warn', input);
    },
    info: (input) => {
      emit('info', input);
    },
  };
}

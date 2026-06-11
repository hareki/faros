import { type LogEntry, type LogLevel, type NormalizedError } from './types';

const LEVEL_LABEL: Record<LogLevel, string> = {
  error: 'ERROR',
  warn: 'WARN',
  info: 'INFO',
};

/** Turn an unknown thrown value into a structured, serializable shape. */
export function normalizeError(error: unknown): NormalizedError | undefined {
  if (error === undefined || error === null) {
    return undefined;
  }

  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }

  if (typeof error === 'string') {
    return { name: 'NonError', message: error };
  }

  try {
    return { name: 'NonError', message: JSON.stringify(error) };
  } catch {
    // JSON.stringify throws on circular structures — fall back to the type tag.
    return { name: 'NonError', message: `Unserializable ${typeof error} thrown` };
  }
}

function indent(text: string): string {
  return text
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');
}

/**
 * `pretty` => human-readable multi-line block (dev). Otherwise => single-line JSON
 * (prod, aggregator/Sentry friendly).
 */
export function formatEntry(entry: LogEntry, pretty: boolean): string {
  if (!pretty) {
    return JSON.stringify(entry);
  }

  const lines: string[] = [
    `[${entry.timestamp}] ${LEVEL_LABEL[entry.level]} (${entry.source}) ${entry.message}`,
  ];

  if (entry.context && Object.keys(entry.context).length > 0) {
    lines.push(`  context: ${JSON.stringify(entry.context)}`);
  }

  if (entry.error) {
    // `stack` already embeds the name + message on its first line, so prefer it
    // and fall back to name/message only when no stack is available.
    lines.push(indent(entry.error.stack ?? `${entry.error.name}: ${entry.error.message}`));
  }

  return lines.join('\n');
}

import type clientMessages from '../messages/en-US/client.json';

/**
 * Shape of the messages allowed to reach the browser (`messages/{locale}/client.json`).
 * Type client component message props from this instead of `Messages` so
 * server-only strings can never be included.
 */
export type ClientMessages = typeof clientMessages;

/**
 * Registry of client namespaces served to every page via `GlobalClientIntlProvider`.
 * Feature-specific client messages are passed as props (or through a
 * feature-scoped provider) instead, so each page ships only what it needs.
 */
export const GLOBAL_CLIENT_NAMESPACES = [
  'validation',
  'errorBoundary',
  'components',
] as const satisfies readonly (keyof ClientMessages)[];

/** Picks a subset of top-level namespaces from a message tree. */
export function pickNamespaces<
  TMessages extends object,
  TKeys extends readonly (keyof TMessages)[],
>(messages: TMessages, namespaces: TKeys): Pick<TMessages, TKeys[number]> {
  return Object.fromEntries(
    namespaces.map((namespace) => [namespace, messages[namespace]]),
  ) as Pick<TMessages, TKeys[number]>;
}

type MessageTree = { [key: string]: string | MessageTree };

/**
 * Recursively merges the client and server message trees of a locale into the
 * single tree next-intl works with on the server. The two trees may share
 * branches (e.g. `auth.signUp`) but never leaves — `scripts/checkMessageStructure.ts`
 * guards against silent overrides.
 */
export function mergeMessages<TBase extends MessageTree, TOverlay extends MessageTree>(
  base: TBase,
  overlay: TOverlay,
): TBase & TOverlay {
  const merged: MessageTree = { ...base };

  for (const [key, value] of Object.entries(overlay)) {
    const existing = merged[key];

    merged[key] =
      typeof existing === 'object' && typeof value === 'object'
        ? mergeMessages(existing, value)
        : value;
  }

  return merged as TBase & TOverlay;
}

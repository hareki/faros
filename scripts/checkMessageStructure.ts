import { locales } from '@/src/lib/next-intl/config';

type MessageTree = { [key: string]: string | MessageTree };

function leafPaths(tree: MessageTree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    return typeof value === 'string' ? [path] : leafPaths(value, path);
  });
}

// A client path and a server path conflict when one would override the other
// in the deep merge done by request.ts: same leaf, or a leaf in one tree that
// is a branch in the other.
function conflicts(clientPath: string, serverPath: string): boolean {
  return (
    clientPath === serverPath ||
    clientPath.startsWith(`${serverPath}.`) ||
    serverPath.startsWith(`${clientPath}.`)
  );
}

let failed = false;

for (const locale of locales) {
  const client: MessageTree = (await import(`../src/lib/next-intl/messages/${locale}/client.json`))
    .default;
  const server: MessageTree = (await import(`../src/lib/next-intl/messages/${locale}/server.json`))
    .default;

  const clientLeaves = leafPaths(client);
  const overlaps = leafPaths(server).filter((serverPath) =>
    clientLeaves.some((clientPath) => conflicts(clientPath, serverPath)),
  );

  if (overlaps.length > 0) {
    failed = true;
    console.error(
      `[${locale}] keys defined in both client.json and server.json:\n  ${overlaps.join('\n  ')}`,
    );
  }
}

if (failed) {
  process.exit(1);
}

console.log('No client/server message overlaps found.');

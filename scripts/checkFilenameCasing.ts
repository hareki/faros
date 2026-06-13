import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

// macOS/Windows filesystems are case-insensitive, so an import whose casing
// differs from the git-tracked filename resolves locally but breaks Vercel's
// case-sensitive Linux build. This guard fails when the on-disk casing of any
// tracked path diverges from what git recorded, or when two tracked paths
// collide on case alone.

const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();

const trackedFiles = execFileSync('git', ['ls-files'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
})
  .split('\n')
  .filter(Boolean);

// Cache directory listings so each directory is read from disk only once.
const listingCache = new Map<string, Set<string>>();

function entriesOf(dir: string): Set<string> {
  let entries = listingCache.get(dir);

  if (!entries) {
    entries = new Set(readdirSync(join(repoRoot, dir)));
    listingCache.set(dir, entries);
  }

  return entries;
}

const casingMismatches: string[] = [];
const caseCollisions: string[] = [];
const seenLowercase = new Map<string, string>();

for (const file of trackedFiles) {
  const lower = file.toLowerCase();
  const previous = seenLowercase.get(lower);

  if (previous && previous !== file) {
    caseCollisions.push(`${previous}  <=>  ${file}`);
  } else {
    seenLowercase.set(lower, file);
  }

  // Walk each path segment and confirm the on-disk entry matches git's casing
  // exactly. readdirSync returns the true on-disk names even on a
  // case-insensitive filesystem, so an exact-match check catches the drift.
  const segments = file.split('/');
  let dir = '';

  for (const segment of segments) {
    if (!entriesOf(dir).has(segment)) {
      casingMismatches.push(file);
      break;
    }

    dir = dir ? `${dir}/${segment}` : segment;
  }
}

if (casingMismatches.length > 0) {
  console.error(
    `On-disk filename casing differs from git-tracked casing:\n  ${casingMismatches.join('\n  ')}`,
  );
}

if (caseCollisions.length > 0) {
  console.error(`Tracked paths that collide on case alone:\n  ${caseCollisions.join('\n  ')}`);
}

if (casingMismatches.length > 0 || caseCollisions.length > 0) {
  process.exit(1);
}

console.log('No filename casing mismatches found.');

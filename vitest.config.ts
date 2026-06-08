import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Native tsconfig `@/*` path resolution (replaces vite-tsconfig-paths).
    tsconfigPaths: true,
    alias: {
      // `server-only` throws outside an RSC bundler; swap it for an empty module.
      'server-only': path.resolve(__dirname, 'test/stubs/server-only.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    // The auth suite shares one Neon branch and truncates between tests, so test
    // files must not run in parallel.
    fileParallelism: false,
  },
});

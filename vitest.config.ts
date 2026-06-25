import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Native tsconfig `@/*` path resolution (replaces vite-tsconfig-paths).
    tsconfigPaths: true,
    alias: {
      // `server-only` throws outside an RSC bundler; swap it for an empty module.
      'server-only': path.resolve(__dirname, 'src/lib/vitest/stubs/server-only.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/lib/vitest/setup.ts'],
    // The auth suite shares one Neon branch and truncates between tests, so test
    // files must not run in parallel.
    fileParallelism: false,
    // Cross-region latency to the Neon test branch plus Neon's scale-to-zero
    // cold start and scrypt password hashing push the heaviest auth tests past
    // vitest's 5s default in CI, so widen both the test and hook budgets.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});

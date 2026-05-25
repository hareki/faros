import './app/lib/t3-env';

import { type NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
};

const withNextIntl = createNextIntlPlugin({
  requestConfig: './app/lib/next-intl/request.ts',
  experimental: {
    // Not using a `src` folder
    srcPath: './',
    createMessagesDeclaration: './app/lib/next-intl/messages/en-US.json',
  },
});

export default withNextIntl(nextConfig);

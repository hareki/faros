import './app/lib/t3-env';

import { type NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

export const MESSAGE_PATH = './app/lib/next-intl/messages/en-US.json';

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    viewTransition: true,
  },
};

const withNextIntl = createNextIntlPlugin({
  requestConfig: './app/lib/next-intl/request.ts',
  experimental: {
    // Not using a `src` folder
    srcPath: './',
    createMessagesDeclaration: MESSAGE_PATH,
  },
});

export default withNextIntl(nextConfig);

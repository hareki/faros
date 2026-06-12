import './app/lib/t3-env/load-env';
// Validate env variables at buildtime
import './app/lib/t3-env/client';
import './app/lib/t3-env/server';

import { type NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

export const MESSAGE_PATHS = [
  './app/lib/next-intl/messages/en-US/client.json',
  './app/lib/next-intl/messages/en-US/server.json',
];

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  cacheComponents: true,
  // The email templates package ships raw .tsx source; let Next transpile it.
  transpilePackages: ['@faros/emails'],
  experimental: {
    viewTransition: true,
  },
};

const withNextIntl = createNextIntlPlugin({
  requestConfig: './app/lib/next-intl/request.ts',
  experimental: {
    // Not using a `src` folder
    srcPath: './',
    createMessagesDeclaration: MESSAGE_PATHS,
  },
});

export default withNextIntl(nextConfig);

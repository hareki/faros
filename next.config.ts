import { type NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactCompiler: true,
};

const withNextIntl = createNextIntlPlugin({
  requestConfig: './lib/next-intl/request.ts',
  experimental: {
    // This is required when `extract` is enabled.
    // Not using a `src` folder
    srcPath: './',

    // Enables usage of `useExtracted`
    // extract: true,
    messages: {
      path: './locales',
      // https://next-intl.dev/docs/usage/extraction#formats
      format: 'po',
      locales: 'infer',
      sourceLocale: 'en-US',
      precompile: true,
    },

    createMessagesDeclaration: './locales/en-US.json',
  },
});

export default withNextIntl(nextConfig);

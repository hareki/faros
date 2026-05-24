import type messages from '../../../locales/en-US.json';

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof messages;
  }
}

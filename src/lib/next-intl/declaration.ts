import type clientMessages from './messages/en-US/client.json';
import type serverMessages from './messages/en-US/server.json';

declare module 'next-intl' {
  interface AppConfig {
    // Intersection mirrors the runtime deep merge in request.ts
    Messages: typeof clientMessages & typeof serverMessages;
  }
}

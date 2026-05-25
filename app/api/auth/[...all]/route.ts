import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@/app/lib/better-auth';

// https://better-auth.com/docs/integrations/next#create-api-route
export const { GET, POST } = toNextJsHandler(auth);

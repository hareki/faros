import { MESSAGE_PATH } from '@/next.config.js';

// @ts-expect-error No declaration files for this util function
import createMessagesDeclaration from '../node_modules/next-intl/dist/esm/development/plugin/declaration/createMessagesDeclaration.js';

createMessagesDeclaration([MESSAGE_PATH]);
console.log(`Generated declaration for: ${MESSAGE_PATH}`);

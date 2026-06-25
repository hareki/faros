'use client';

import {
  IconCircleCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconLoader,
  IconAlertCircle,
} from '@tabler/icons-react';

/** Type-keyed toast icons shared by the `<Toaster>` and the headless `Toast` card. */
export const toastIcons = {
  success: <IconCircleCheck className='size-5 text-success' />,
  info: <IconInfoCircle className='size-5 text-info' />,
  warning: <IconAlertTriangle className='size-5 text-warning' />,
  error: <IconAlertCircle className='size-5 text-error' />,
  loading: <IconLoader className='size-5 animate-spin' />,
};

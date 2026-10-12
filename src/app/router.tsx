import { createBrowserRouter } from 'react-router';
import { routes } from '@shared/config';
import { RouteErrorFallback } from './providers/RouteErrorFallback';

// Routes are added one at a time as each page TASK is reviewed and done (see plan/PROGRESS.md).
export const router = createBrowserRouter([
  {
    path: routes.home,
    lazy: async () => ({ Component: (await import('@pages/home')).HomePage }),
    errorElement: <RouteErrorFallback />,
  },
  {
    path: routes.workbook,
    lazy: async () => ({ Component: (await import('@pages/workbook')).WorkbookPage }),
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '*',
    element: null,
    errorElement: <RouteErrorFallback />,
  },
]);

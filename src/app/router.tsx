import { createBrowserRouter } from 'react-router';
import { RouteErrorFallback } from './providers/RouteErrorFallback';

// No page slice has a public index.ts yet (pages/home, pages/workbook are mid-review) — routes are
// added here one at a time as each page TASK is reviewed and done (see plan/PROGRESS.md).
export const router = createBrowserRouter([
  {
    path: '*',
    element: null,
    errorElement: <RouteErrorFallback />,
  },
]);

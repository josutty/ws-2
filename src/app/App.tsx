import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router/dom';
import { ErrorBoundary } from 'react-error-boundary';
import { logger } from '@shared/lib/logger';
import { store } from './store';
import { router } from './router';
import { AppCrashFallback } from './providers/AppCrashFallback';

export function App() {
  return (
    <ErrorBoundary FallbackComponent={AppCrashFallback} onError={(error) => logger.error('App crashed', { error })}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ErrorBoundary>
  );
}

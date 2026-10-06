import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { logger } from '@shared/lib/logger';

/** errorElement for router routes — a route-level crash shouldn't take down the whole app shell. */
export function RouteErrorFallback() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'Unexpected error';

  useEffect(() => {
    logger.error('Route error', { error });
  }, [error]);

  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center text-fg"
    >
      <h1 className="text-lg font-semibold">{message}</h1>
      <p className="text-body-sm text-fg-muted">Please go back or reload the page.</p>
      <a
        href="/"
        className="rounded-control bg-primary px-4 py-2 text-body-sm font-medium text-primary-fg hover:bg-primary-hover"
      >
        Back to start
      </a>
    </div>
  );
}

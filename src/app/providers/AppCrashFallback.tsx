import type { FallbackProps } from 'react-error-boundary';

/** Last-resort UI when the whole app tree throws — logging happens in App's onError, not here. */
export function AppCrashFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center text-fg"
    >
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-body-sm text-fg-muted">Please reload the page. If the problem continues, contact support.</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-control bg-primary px-4 py-2 text-body-sm font-medium text-primary-fg hover:bg-primary-hover"
      >
        Reload
      </button>
    </div>
  );
}

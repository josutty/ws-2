export interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (message === null) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-control border border-border bg-surface px-4 py-2 text-body-sm text-fg shadow-elevated"
    >
      {message}
    </div>
  );
}

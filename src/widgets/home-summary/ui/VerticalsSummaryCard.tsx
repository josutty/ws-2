import { useGetDealerCycleSummaryQuery } from '@entities/cycle';
import { getErrorMessage } from '@shared/api';
import { Badge, Button } from '@shared/ui';

export interface VerticalsSummaryCardProps {
  onOpen: (vertical: string) => void;
}

const VERTICAL = 'FERT';

export function VerticalsSummaryCard({ onOpen }: VerticalsSummaryCardProps) {
  const { data, isLoading, isFetching, isError, error, refetch } = useGetDealerCycleSummaryQuery({});

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  if (!data) return <EmptyState />;

  const total = data.lines;
  const entered = Math.max(total - data.totals.blankLines, 0);
  const status = data.status === 'SUBMITTED' ? 'submitted' : entered === 0 ? 'not-started' : 'in-progress';

  return (
    <section aria-busy={isFetching} className="rounded-card border border-border bg-surface p-4 shadow-card">
      <h2 className="text-heading-2 font-semibold text-fg">Vertical summaries</h2>
      <table className="mt-4 w-full border-separate border-spacing-y-2 text-body-sm text-fg">
        <thead className="sr-only">
          <tr><th>Vertical</th><th>Status</th><th>Entered</th><th>Action</th></tr>
        </thead>
        <tbody>
          <tr className="rounded-card bg-surface-muted">
            <td className="rounded-l-card px-3 py-2 font-semibold">{VERTICAL}</td>
            <td className="px-3 py-2"><StatusBadge status={status} /></td>
            <td className="px-3 py-2 tabular-nums">{entered} / {total}</td>
            <td className="rounded-r-card px-3 py-2 text-right">
              <Button variant="ghost" size="sm" onClick={() => onOpen(VERTICAL)}>Open {VERTICAL}</Button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

function StatusBadge({ status }: { status: 'not-started' | 'in-progress' | 'submitted' }) {
  if (status === 'submitted') return <Badge tone="ok">Submitted</Badge>;
  if (status === 'not-started') return <Badge tone="crit">Not started</Badge>;
  return <Badge tone="warn">In progress</Badge>;
}

function LoadingState() {
  return (
    <section role="status" aria-label="Loading vertical summaries" aria-busy="true" className="rounded-card border border-border bg-surface p-4 shadow-card">
      <p className="text-body-sm text-fg-muted">Loading vertical summaries</p>
      <div aria-hidden="true" className="mt-4 space-y-2">
        <span className="block h-8 w-full animate-pulse rounded-control bg-surface-muted" />
        <span className="block h-8 w-full animate-pulse rounded-control bg-surface-muted" />
      </div>
    </section>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section role="alert" className="rounded-card border border-danger/30 bg-danger-soft p-4 text-body-sm text-danger">
      <p>{message}</p>
      <div className="mt-3"><Button variant="ghost" size="sm" onClick={onRetry}>Retry</Button></div>
    </section>
  );
}

function EmptyState() {
  return <section className="rounded-card border border-border bg-surface p-4 text-body-sm text-fg-muted shadow-card">No vertical summaries available.</section>;
}

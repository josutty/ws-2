import { useGetDealerCycleSummaryQuery } from '@entities/cycle';
import { getErrorMessage } from '@shared/api';
import { Badge, Button } from '@shared/ui';

export interface IndentProgressCardProps {
  onContinue: () => void;
  onReviewSubmit: () => void;
}

const VERTICAL = 'FERT';

export function IndentProgressCard({ onContinue, onReviewSubmit }: IndentProgressCardProps) {
  const { data, isLoading, isFetching, isError, error, refetch } = useGetDealerCycleSummaryQuery({});

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  if (!data) return <EmptyState />;

  const total = data.lines;
  const entered = Math.max(total - data.totals.blankLines, 0);
  const julyTotal = data.totals.months.find((month) => month.periodId === '2026-07' || month.label.includes('July'));
  const submitted = data.status === 'SUBMITTED';

  return (
    <section aria-busy={isFetching} className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-heading-2 font-semibold text-fg">Your July indent — {VERTICAL}</h2>
            <p className="mt-1 text-body-sm text-fg-muted">{entered} of {total} lines entered</p>
          </div>
          <Badge tone={submitted ? 'ok' : 'warn'}>{submitted ? 'Submitted' : 'Not submitted'}</Badge>
        </div>
        <p className="text-heading-3 font-semibold text-fg">{julyTotal?.value ?? 0} units for July</p>
        <div
          role="progressbar"
          aria-label="Indent entry progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={entered}
          className="h-3 rounded-pill border border-border bg-surface-muted"
        >
          <span className="block h-full rounded-pill bg-primary" />
        </div>
        <p className="rounded-card border border-warning/30 bg-warning-soft p-3 text-body-sm text-warning">
          Auto-submit reminder: complete and review before {new Date(data.closesAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onContinue}>Continue</Button>
          <Button variant="primary" onClick={onReviewSubmit}>Review &amp; submit</Button>
        </div>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <section role="status" aria-label="Loading indent progress" aria-busy="true" className="rounded-card border border-border bg-surface p-4 shadow-card">
      <p className="text-body-sm text-fg-muted">Loading indent progress</p>
      <div aria-hidden="true" className="mt-4 space-y-3">
        <span className="block h-5 w-2/3 animate-pulse rounded-control bg-surface-muted" />
        <span className="block h-3 w-full animate-pulse rounded-pill bg-surface-muted" />
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
  return <section className="rounded-card border border-border bg-surface p-4 text-body-sm text-fg-muted shadow-card">No indent summary available.</section>;
}

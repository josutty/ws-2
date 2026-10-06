import { useListDealerIndentLinesQuery } from '@entities/indent-line';
import { getErrorMessage, type IndentLine } from '@shared/api';
import { Button } from '@shared/ui';

const SEGMENT_CLASSES = ['bg-success', 'bg-warning', 'bg-danger'] as const;

export function DemandMixCard() {
  const { data, isLoading, isFetching, isError, error, refetch } = useListDealerIndentLinesQuery({ size: 50, includeReference: true });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  if (!data?.items.length) return <EmptyState />;

  const segments = getDemandMix(data.items);
  const total = data.items.length;

  return (
    <section aria-busy={isFetching} className="rounded-card border border-border bg-surface p-4 shadow-card">
      <h2 className="text-heading-2 font-semibold text-fg">Demand mix</h2>
      <p className="mt-2 text-heading-2 font-bold text-fg">{formatNumber(total)} FERTs</p>
      <ul aria-label="Demand mix breakdown" className="mt-4 flex min-h-8 overflow-hidden rounded-control">
        {segments.map((segment, index) => {
          const percent = total === 0 ? 0 : Math.round((segment.count / total) * 100);
          return (
            <li key={segment.label} aria-label={`${segment.label} ${segment.count} FERTs ${percent}%`} className={`flex-1 ${SEGMENT_CLASSES[index]}`} title={`${segment.label} ${segment.count} FERTs ${percent}%`}>
              <span className="sr-only">{segment.label} {formatNumber(segment.count)} FERTs {percent}%</span>
            </li>
          );
        })}
      </ul>
      <ul aria-label="Demand mix legend" className="mt-3 grid gap-2 text-body-sm text-fg sm:grid-cols-3">
        {segments.map((segment, index) => (
          <li key={segment.label} className="flex items-center gap-2">
            <span aria-hidden="true" className={`h-3 w-3 rounded-xs ${SEGMENT_CLASSES[index]}`} />
            <span>{segment.label}</span>
            <span className="font-semibold">{formatNumber(segment.count)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-body-sm text-fg-muted">{getDemandMixCaption(segments)}</p>
      <p className="mt-1 text-body-sm text-fg-muted">Mix is based on each product's Eicher segment.</p>
    </section>
  );
}

function getDemandMixCaption(segments: Array<{ label: string; count: number }>) {
  return `${segments.map((segment) => `${segment.label} ${formatNumber(segment.count)} ${segment.count === 1 ? 'line' : 'lines'}`).join(', ')}.`;
}

function getDemandMix(lines: IndentLine[]) {
  const totals = lines.reduce(
    (sum, line) => ({
      Runner: sum.Runner + (line.product.eicherSegment === 'Runner' ? 1 : 0),
      Repeater: sum.Repeater + (line.product.eicherSegment === 'Repeater' ? 1 : 0),
      Stranger: sum.Stranger + (line.product.eicherSegment === 'Stranger' || !line.product.eicherSegment ? 1 : 0),
    }),
    { Runner: 0, Repeater: 0, Stranger: 0 },
  );
  return [
    { label: 'Runner', count: totals.Runner },
    { label: 'Repeater', count: totals.Repeater },
    { label: 'Stranger', count: totals.Stranger },
  ];
}

function LoadingState() {
  return (
    <section role="status" aria-label="Loading demand mix" aria-busy="true" className="rounded-card border border-border bg-surface p-4 shadow-card">
      <p className="text-body-sm text-fg-muted">Loading demand mix</p>
      <span aria-hidden="true" className="mt-4 block h-16 animate-pulse rounded-card bg-surface-muted" />
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
  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-card">
      <h2 className="text-heading-2 font-semibold text-fg">Demand mix</h2>
      <p className="mt-4 rounded-card border border-border bg-surface-muted p-3 text-body-sm text-fg-muted">No indent lines in scope.</p>
    </section>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}

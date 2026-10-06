import { useListDealerIndentLinesQuery } from '@entities/indent-line';
import { getErrorMessage, type IndentLine } from '@shared/api';
import { Button } from '@shared/ui';

export interface StockAgingCardProps {
  onShowAged180: () => void;
}

const SEGMENT_CLASSES = ['bg-fg-subtle/30', 'bg-warning-soft', 'bg-warning-strong', 'bg-danger'] as const;

export function StockAgingCard({ onShowAged180 }: StockAgingCardProps) {
  const { data, isLoading, isFetching, isError, error, refetch } = useListDealerIndentLinesQuery({ size: 50, includeReference: true });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  if (!data?.items.length) return <EmptyState />;

  const segments = getStockSegments(data.items);
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const over60 = segments.slice(1).reduce((sum, segment) => sum + segment.count, 0);

  return (
    <section aria-busy={isFetching} className="rounded-card border border-border bg-surface p-4 shadow-card">
      <h2 className="text-heading-2 font-semibold text-fg">Stock aging</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <p className="rounded-card bg-surface-muted p-3 text-heading-2 font-bold text-fg">{formatNumber(total)} units on hand</p>
        <p className="rounded-card bg-warning-soft p-3 text-heading-2 font-bold text-warning">{formatNumber(over60)} units over 60 days</p>
      </div>

      <ul aria-label="Stock aging breakdown" className="mt-4 flex min-h-8 overflow-hidden rounded-control">
        {segments.map((segment, index) => {
          const percent = total === 0 ? 0 : Math.round((segment.count / total) * 100);
          return (
            <li
              key={segment.label}
              aria-label={`${segment.label} ${segment.count} units ${percent}%`}
              className={`flex min-w-10 flex-1 items-center justify-center px-2 text-caption font-semibold text-fg ${SEGMENT_CLASSES[index]}`}
              title={`${segment.label} ${segment.count} units ${percent}%`}
            >
              <span className="sr-only">{segment.label}</span>
              <span className="sr-only">{getSegmentCountText(segment)}</span>
              <span className="sr-only">{percent}%</span>
            </li>
          );
        })}
      </ul>

      <ul aria-label="Stock aging legend" className="mt-3 grid gap-2 text-body-sm text-fg sm:grid-cols-2">
        {segments.map((segment, index) => (
          <li key={segment.label} className="flex items-center gap-2">
            <span aria-hidden="true" className={`h-3 w-3 rounded-xs ${SEGMENT_CLASSES[index]}`} />
            <span>{segment.label}</span>
            <span className="font-semibold">{formatNumber(segment.count)} units</span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <Button variant="ghost" size="sm" onClick={onShowAged180}>Show over 180 days <span aria-hidden="true">→</span></Button>
      </div>
    </section>
  );
}

function getStockSegments(lines: IndentLine[]) {
  const totals = lines.reduce(
    (sum, line) => ({
      under60Days: sum.under60Days + line.stockBreakdown.under60Days,
      days60To90: sum.days60To90 + line.stockBreakdown.days60To90,
      days90To180: sum.days90To180 + line.stockBreakdown.days90To180,
      over180Days: sum.over180Days + line.stockBreakdown.over180Days,
    }),
    { under60Days: 0, days60To90: 0, days90To180: 0, over180Days: 0 },
  );
  return [
    { label: '<60D', count: totals.under60Days },
    { label: '60–90D', count: totals.days60To90 },
    { label: '90–180D', count: totals.days90To180 },
    { label: '>180D', count: totals.over180Days },
  ];
}

function getSegmentCountText(segment: { label: string; count: number }) {
  const unitsText = `${formatNumber(segment.count)} units`;
  return segment.label === '>180D' ? `${unitsText} over 180 days` : unitsText;
}

function LoadingState() {
  return (
    <section role="status" aria-label="Loading stock aging" aria-busy="true" className="rounded-card border border-border bg-surface p-4 shadow-card">
      <p className="text-body-sm text-fg-muted">Loading stock aging</p>
      <div aria-hidden="true" className="mt-4 space-y-3">
        <span className="block h-8 animate-pulse rounded-control bg-surface-muted" />
        <span className="block h-16 animate-pulse rounded-card bg-surface-muted" />
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
  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-card">
      <h2 className="text-heading-2 font-semibold text-fg">Stock aging</h2>
      <p className="mt-4 rounded-card border border-border bg-surface-muted p-3 text-body-sm text-fg-muted">No indent lines in scope.</p>
    </section>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}

import { useState } from 'react';
import { useGetDealerAccuracyHistoryQuery } from '@entities/accuracy';
import { getErrorMessage, type AccuracyMonth } from '@shared/api';
import { Badge, Button } from '@shared/ui';
import { AccuracyReportPanel } from './AccuracyReportPanel';

export interface IndentAccuracyCardProps {
  tolerancePct: number;
}

export function IndentAccuracyCard({ tolerancePct }: IndentAccuracyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetDealerAccuracyHistoryQuery({ groupBy: 'outlet' });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;

  const history = mergeHistory(data?.rows.flatMap((row) => row.history) ?? []);
  const accuracy = getAccuracy(history);
  const bias = getBias(history, tolerancePct);

  return (
    <section aria-busy={isFetching} className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-heading-2 font-semibold text-fg">Your indent accuracy</h2>
            <p className="mt-1 text-body-sm text-fg-muted">Four-cycle average with offtake bias.</p>
          </div>
          <Badge tone={bias.withinTolerance ? 'ok' : 'warn'}>Within ±{tolerancePct}%</Badge>
        </div>

        {history.length === 0 ? <p className="rounded-card border border-border bg-surface-muted p-3 text-body-sm text-fg-muted">No accuracy history available.</p> : null}

        <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-end">
          <div>
            <p className="text-display font-bold text-fg">{accuracy}%</p>
            <p className="text-body-sm text-fg-muted">{bias.label} · {Math.abs(bias.percent)}% bias</p>
          </div>
          <Sparkline history={history} />
        </div>

        <p className="text-body-sm text-fg-muted">Accuracy compares dealer indent with actual offtake across the last four cycles.</p>
        <div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded((current) => !current)}>{expanded ? 'Hide report card' : 'View report card'}</Button>
        </div>
        {expanded ? <AccuracyReportPanel /> : null}
      </div>
    </section>
  );
}

function Sparkline({ history }: { history: AccuracyMonth[] }) {
  return (
    <div role="img" aria-label="Indent accuracy trend" className="flex min-h-24 items-end gap-2 rounded-card bg-surface-muted p-3">
      {history.map((month) => {
        const accuracy = getAccuracy([month]);
        return (
          <span key={month.month} className="flex flex-1 flex-col items-center gap-1">
            <span title={`${month.month}: ${accuracy}%`} aria-hidden="true" className={`w-full rounded-pill bg-primary ${getBarHeightClass(accuracy)}`} />
            <span className="sr-only">{month.month}: {accuracy}% accuracy, {month.indented} indented, {month.offtake} offtake</span>
          </span>
        );
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <section role="status" aria-label="Loading indent accuracy" aria-busy="true" className="rounded-card border border-border bg-surface p-4 shadow-card">
      <p className="text-body-sm text-fg-muted">Loading indent accuracy</p>
      <div aria-hidden="true" className="mt-4 grid gap-3 sm:grid-cols-2">
        <span className="h-16 animate-pulse rounded-card bg-surface-muted" />
        <span className="h-16 animate-pulse rounded-card bg-surface-muted" />
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

function mergeHistory(history: AccuracyMonth[]) {
  const months = Array.from(new Set(history.map((month) => month.month)));
  return months.map((month) => history.reduce<AccuracyMonth>((total, item) => (
    item.month === month ? { month, indented: total.indented + item.indented, offtake: total.offtake + item.offtake } : total
  ), { month, indented: 0, offtake: 0 }));
}

function getAccuracy(history: AccuracyMonth[]) {
  const indented = history.reduce((sum, month) => sum + month.indented, 0);
  const offtake = history.reduce((sum, month) => sum + month.offtake, 0);
  return indented === 0 ? 0 : Math.round((offtake / indented) * 100);
}

function getBarHeightClass(percent: number) {
  if (percent >= 95) return 'h-24';
  if (percent >= 75) return 'h-20';
  if (percent >= 50) return 'h-14';
  if (percent >= 25) return 'h-8';
  return 'h-3';
}

function getBias(history: AccuracyMonth[], tolerancePct: number) {
  const indented = history.reduce((sum, month) => sum + month.indented, 0);
  const offtake = history.reduce((sum, month) => sum + month.offtake, 0);
  const percent = offtake === 0 ? 0 : Math.round(((indented - offtake) / offtake) * 100);
  const withinTolerance = Math.abs(percent) <= tolerancePct;
  const label = percent > 0 ? 'Over-indent' : percent < 0 ? 'Under-indent' : 'Balanced';
  return { label, percent, withinTolerance };
}

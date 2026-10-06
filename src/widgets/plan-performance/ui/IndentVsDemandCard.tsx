import { useListDealerIndentLinesQuery } from '@entities/indent-line';
import { getErrorMessage, type IndentLine } from '@shared/api';
import { Badge, Button } from '@shared/ui';

export interface IndentVsDemandCardProps {
  onShowOffTrack?: () => void;
}

type Tone = 'ok' | 'warn' | 'crit';

export function IndentVsDemandCard({ onShowOffTrack }: IndentVsDemandCardProps) {
  const { data, isLoading, isFetching, isError, error, refetch } = useListDealerIndentLinesQuery({ size: 50, includeReference: true });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  if (!data?.items.length) return <EmptyState />;

  const totals = getIndentDemandTotals(data.items);
  const monthlyRunRate = totals.offTakeL3 / 3;
  const runRateComparison = getComparison(totals.julyIndent, monthlyRunRate);
  const lastCycleComparison = getComparison(totals.julyIndent, totals.lastCycle);

  return (
    <section aria-busy={isFetching} className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-heading-2 font-semibold text-fg">Indent vs demand</h2>
          <p className="mt-1 text-body-sm text-fg-muted">July indent compared with demand signals.</p>
        </div>
        <Badge tone={runRateComparison.tone}>{runRateComparison.label}</Badge>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="July indent" value={`${formatNumber(totals.julyIndent)} units`} />
        <Metric label="3-month offtake" value={`${formatNumber(totals.offTakeL3)} units`} />
        <Metric label="Last cycle plan" value={`${formatNumber(totals.lastCycle)} units`} />
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 text-body-sm">
        <Badge tone={runRateComparison.tone}>{runRateComparison.text} vs monthly run-rate</Badge>
        <Badge tone={lastCycleComparison.tone}>{lastCycleComparison.text} vs last cycle plan</Badge>
      </div>

      {onShowOffTrack ? (
        <div className="mt-4">
          <Button variant="ghost" size="sm" onClick={onShowOffTrack}>Show off-track lines</Button>
        </div>
      ) : null}
    </section>
  );
}

function getIndentDemandTotals(lines: IndentLine[]) {
  return lines.reduce(
    (totals, line) => ({
      julyIndent: totals.julyIndent + sumJulyPeriods(line),
      offTakeL3: totals.offTakeL3 + line.offTakeL3,
      lastCycle: totals.lastCycle + line.lastCycle,
    }),
    { julyIndent: 0, offTakeL3: 0, lastCycle: 0 },
  );
}

function sumJulyPeriods(line: IndentLine) {
  return line.periods.filter((period) => period.periodId.startsWith('2026-07')).reduce((sum, period) => sum + period.value, 0);
}

function getComparison(value: number, baseline: number): { label: string; text: string; tone: Tone } {
  const percent = baseline === 0 ? 0 : Math.round(((value - baseline) / baseline) * 100);
  const tone: Tone = percent < -15 ? 'crit' : percent > 15 ? 'warn' : 'ok';
  const label = tone === 'crit' ? 'Critical' : tone === 'warn' ? 'Watch' : 'On track';
  return { label, text: `${percent >= 0 ? '+' : ''}${percent}%`, tone };
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-surface-muted p-3">
      <dt className="text-caption font-semibold uppercase tracking-label text-fg-muted">{label}</dt>
      <dd className="mt-1 text-heading-2 font-bold text-fg">{value}</dd>
    </div>
  );
}

function LoadingState() {
  return (
    <section role="status" aria-label="Loading indent versus demand" aria-busy="true" className="rounded-card border border-border bg-surface p-4 shadow-card">
      <p className="text-body-sm text-fg-muted">Loading indent versus demand</p>
      <div aria-hidden="true" className="mt-4 grid gap-3 sm:grid-cols-3">
        <span className="h-16 animate-pulse rounded-card bg-surface-muted" />
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

function EmptyState() {
  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-card">
      <h2 className="text-heading-2 font-semibold text-fg">Indent vs demand</h2>
      <p className="mt-4 rounded-card border border-border bg-surface-muted p-3 text-body-sm text-fg-muted">No indent lines in scope.</p>
    </section>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}

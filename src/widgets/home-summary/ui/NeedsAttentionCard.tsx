import { useGetDealerCycleSummaryQuery } from '@entities/cycle';
import { useListDealerIndentLinesQuery } from '@entities/indent-line';
import { getErrorMessage, type IndentLine } from '@shared/api';
import { Button } from '@shared/ui';

export interface NeedsAttentionCardProps {
  onShow: (flag: string) => void;
}

const FLAGS = [
  { key: 'no-entry', label: 'No entry' },
  { key: 'aged-stock', label: 'Aged stock >180D' },
  { key: 'off-last-cycle', label: '±20% off last cycle' },
  { key: 'added-this-cycle', label: 'Added this cycle' },
] as const;

type FlagKey = (typeof FLAGS)[number]['key'];

export function NeedsAttentionCard({ onShow }: NeedsAttentionCardProps) {
  useGetDealerCycleSummaryQuery({});
  const { data, isLoading, isFetching, isError, error, refetch } = useListDealerIndentLinesQuery({ size: 50, includeReference: true });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;

  const flagCounts = countFlags(data?.items ?? []);
  const visibleFlags = FLAGS.filter((flag) => flagCounts[flag.key] > 0);

  return (
    <section aria-busy={isFetching} className="rounded-card border border-border bg-surface p-4 shadow-card">
      <h2 className="text-heading-2 font-semibold text-fg">Needs attention</h2>
      {visibleFlags.length === 0 ? (
        <p className="mt-4 rounded-card border border-success/30 bg-success-soft p-3 text-body-sm text-success">✓ Nothing needs your attention right now.</p>
      ) : (
        <ul aria-label="Needs attention" className="mt-4 space-y-2">
          {visibleFlags.map((flag) => (
            <li key={flag.key} aria-label={`${flagCounts[flag.key]} ${flag.label} Show`} className="flex items-center justify-between gap-3 rounded-card bg-surface-muted px-3 py-2 text-body-sm text-fg">
              <span><strong className="text-fg">{flagCounts[flag.key]}</strong> {flag.label}</span>
              <Button variant="ghost" size="sm" onClick={() => onShow(flag.key)}>Show {flag.key}</Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function countFlags(lines: IndentLine[]): Record<FlagKey, number> {
  return lines.reduce<Record<FlagKey, number>>(
    (counts, line) => ({
      'no-entry': counts['no-entry'] + (isNoEntry(line) ? 1 : 0),
      'aged-stock': counts['aged-stock'] + (isAgedStock(line) ? 1 : 0),
      'off-last-cycle': counts['off-last-cycle'] + (isOffLastCycle(line) ? 1 : 0),
      'added-this-cycle': counts['added-this-cycle'] + (line.version === 0 ? 1 : 0),
    }),
    { 'no-entry': 0, 'aged-stock': 0, 'off-last-cycle': 0, 'added-this-cycle': 0 },
  );
}

function isNoEntry(line: IndentLine) {
  return line.periods.every((period) => period.value === 0);
}

function isAgedStock(line: IndentLine) {
  return line.version > 0 && line.stockBreakdown.over180Days > 0 && line.stockBreakdown.over180Days === line.stockBreakdown.total;
}

function isOffLastCycle(line: IndentLine) {
  if (line.lastCycle === 0 || line.version === 0 || isNoEntry(line) || isAgedStock(line)) return false;
  const julyTotal = line.periods.filter((period) => period.periodId.startsWith('2026-07')).reduce((sum, period) => sum + period.value, 0);
  return Math.abs(julyTotal - line.lastCycle) / line.lastCycle > 0.2;
}

function LoadingState() {
  return (
    <section role="status" aria-label="Loading attention flags" aria-busy="true" className="rounded-card border border-border bg-surface p-4 shadow-card">
      <p className="text-body-sm text-fg-muted">Loading attention flags</p>
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

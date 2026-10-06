import { useState, type KeyboardEvent } from 'react';
import { useGetDealerAccuracyHistoryQuery } from '@entities/accuracy';
import { useListDealerOutletsQuery } from '@entities/dealer';
import { getErrorMessage, type AccuracyMonth, type AccuracyRow, type Outlet } from '@shared/api';
import { Badge, Button } from '@shared/ui';

export interface AccuracyReportPanelProps {
  onSelectFert?: (fertCode: string) => void;
}

type AccuracyView = 'outlet' | 'fert';

export function AccuracyReportPanel({ onSelectFert }: AccuracyReportPanelProps) {
  const [view, setView] = useState<AccuracyView>('outlet');
  const { data, isLoading, isFetching, isError, error, refetch } = useGetDealerAccuracyHistoryQuery({ groupBy: view });
  const outletsQuery = useListDealerOutletsQuery({});

  if (isLoading || (view === 'outlet' && outletsQuery.isLoading)) return <LoadingState />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  if (view === 'outlet' && outletsQuery.isError) {
    return <ErrorState message={getErrorMessage(outletsQuery.error)} onRetry={() => void outletsQuery.refetch()} />;
  }

  const rows = view === 'fert' ? (data?.rows ?? []).slice(0, 25) : mapOutletRows(data?.rows ?? [], outletsQuery.data?.items ?? []);
  const showEmpty = view === 'fert' && rows.length === 0;

  return (
    <section aria-busy={isFetching || outletsQuery.isFetching} className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-heading-3 font-semibold text-fg">Accuracy report card</h3>
          <p className="mt-1 text-body-sm text-fg-muted">Last four cycles of indent accuracy by {view === 'outlet' ? 'outlet' : 'vehicle'}.</p>
        </div>
        <div className="flex gap-2" aria-label="Accuracy report view">
          <Button variant={view === 'outlet' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('outlet')}>By outlet</Button>
          <Button variant={view === 'fert' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('fert')}>By vehicle</Button>
        </div>
      </div>
      {showEmpty ? (
        <p className="mt-4 rounded-card border border-border bg-surface-muted p-3 text-body-sm text-fg-muted">No lines with offtake history in this filter.</p>
      ) : (
        <ReportTable rows={rows} view={view} onSelectFert={onSelectFert} />
      )}
    </section>
  );
}

function ReportTable({ rows, view, onSelectFert }: { rows: AccuracyRow[]; view: AccuracyView; onSelectFert?: (fertCode: string) => void }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table aria-label="Accuracy report card" className="min-w-full border-separate border-spacing-0 text-left text-body-sm">
        <thead>
          <tr className="text-caption font-semibold uppercase tracking-label text-fg-muted">
            <th scope="col" className="border-b border-border px-3 py-2">{view === 'outlet' ? 'Outlet' : 'Vehicle'}</th>
            <th scope="col" className="border-b border-border px-3 py-2">Accuracy</th>
            <th scope="col" className="border-b border-border px-3 py-2">Bias</th>
            <th scope="col" className="border-b border-border px-3 py-2">Monthly indent / offtake</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => <ReportRow key={`${row.code ?? row.name}-${row.history.length}`} row={row} view={view} onSelectFert={onSelectFert} />)}
          {view === 'outlet' ? <ReportRow row={buildTotalRow(rows)} view={view} /> : null}
        </tbody>
      </table>
    </div>
  );
}

function ReportRow({ row, view, onSelectFert }: { row: AccuracyRow; view: AccuracyView; onSelectFert?: (fertCode: string) => void }) {
  const accuracy = getAccuracy(row.history);
  const bias = getBias(row.history);
  const code = row.code ?? '';
  const canSelect = view === 'fert' && code.length > 0;
  const select = () => {
    if (canSelect) onSelectFert?.(code);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      select();
    }
  };

  return (
    <tr className="border-b border-border text-fg">
      <th scope="row" className="border-b border-border px-3 py-2 font-medium">
        {canSelect ? (
          <button type="button" onClick={select} onKeyDown={onKeyDown} className="min-h-6 text-left text-primary hover:text-primary-hover">
            Open FERT accuracy details {code} {row.name}
          </button>
        ) : (
          <span>{row.name}</span>
        )}
      </th>
      <td className="border-b border-border px-3 py-2">
        <div className="flex min-w-28 items-center gap-2">
          <span className="font-semibold">{accuracy}%</span>
          <span aria-hidden="true" className="h-2 flex-1 rounded-pill bg-surface-muted"><span className={`block h-full rounded-pill bg-primary ${getBarWidthClass(accuracy)}`} /></span>
        </div>
      </td>
      <td className="border-b border-border px-3 py-2"><Badge tone={bias.tone}>{bias.label}</Badge></td>
      <td className="border-b border-border px-3 py-2 text-fg-muted">{row.history.map((month) => `${month.month}: ${month.indented}/${month.offtake}`).join(' · ')}</td>
    </tr>
  );
}

function LoadingState() {
  return (
    <section role="status" aria-label="Loading accuracy report card" aria-busy="true" className="rounded-card border border-border bg-surface p-4 shadow-card">
      <p className="text-body-sm text-fg-muted">Loading accuracy report card</p>
      <div aria-hidden="true" className="mt-4 space-y-2">
        <span className="block h-6 animate-pulse rounded-control bg-surface-muted" />
        <span className="block h-10 animate-pulse rounded-control bg-surface-muted" />
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

function mapOutletRows(rows: AccuracyRow[], outlets: Outlet[]) {
  return outlets.length === 0 ? rows : outlets.map((outlet) => rows.find((row) => row.name === outlet.name) ?? { name: outlet.name, history: [] });
}

function buildTotalRow(rows: AccuracyRow[]): AccuracyRow {
  const months = Array.from(new Set(rows.flatMap((row) => row.history.map((month) => month.month))));
  const history = months.map((month) => rows.reduce<AccuracyMonth>((total, row) => {
    const item = row.history.find((entry) => entry.month === month);
    return { month, indented: total.indented + (item?.indented ?? 0), offtake: total.offtake + (item?.offtake ?? 0) };
  }, { month, indented: 0, offtake: 0 }));
  return { name: rows.length === 3 ? 'All three outlets' : 'All outlets', history };
}

function getAccuracy(history: AccuracyMonth[]) {
  const indented = history.reduce((sum, month) => sum + month.indented, 0);
  const offtake = history.reduce((sum, month) => sum + month.offtake, 0);
  return indented === 0 ? 0 : Math.round((offtake / indented) * 100);
}

function getBarWidthClass(percent: number) {
  if (percent >= 95) return 'w-full';
  if (percent >= 75) return 'w-3/4';
  if (percent >= 50) return 'w-1/2';
  if (percent >= 25) return 'w-1/4';
  return 'w-2';
}

function getBias(history: AccuracyMonth[]): { label: string; tone: 'ok' | 'warn' | 'crit' } {
  const indented = history.reduce((sum, month) => sum + month.indented, 0);
  const offtake = history.reduce((sum, month) => sum + month.offtake, 0);
  const percent = offtake === 0 ? 0 : Math.round(((indented - offtake) / offtake) * 100);
  if (Math.abs(percent) <= 10) return { label: 'Balanced', tone: 'ok' };
  return percent > 0 ? { label: 'Over-indent', tone: 'warn' } : { label: 'Under-indent', tone: 'crit' };
}

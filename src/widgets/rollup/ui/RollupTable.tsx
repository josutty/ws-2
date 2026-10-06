import { useMemo, useState } from 'react';
import { useListDealerIndentLinesQuery } from '@entities/indent-line';
import { getErrorMessage, type IndentLine } from '@shared/api';
import { Button } from '@shared/ui';

type GroupBy = 'Vertical' | 'Sub-vertical' | 'MPG' | 'Tonnage' | 'AC/Non-AC' | 'Segment' | 'FERT';
type BandId = 'stock' | 'demand' | 'offtake' | 'retail' | 'lastCycle';
type BandMode = 'summary' | 'full' | 'off';

interface RowTotal {
  label: string;
  lines: IndentLine[];
  periods: number[];
  stock: number;
  stockBreakdown: IndentLine['stockBreakdown'];
  demandMix: Record<'Runner' | 'Repeater' | 'Stranger', number>;
  offTakeTrend: IndentLine['offTakeTrend'];
  retailTrend: IndentLine['retailTrend'];
  lastCycle: number;
}

const GROUPS: GroupBy[] = ['Vertical', 'Sub-vertical', 'MPG', 'Tonnage', 'AC/Non-AC', 'Segment', 'FERT'];
const BANDS: { id: BandId; label: string; fullHeaders: string[] }[] = [
  { id: 'demand', label: 'Demand mix', fullHeaders: ['Runner', 'Repeater', 'Stranger'] },
  { id: 'stock', label: 'Current dealer stock', fullHeaders: ['0-60 days', '60-90 days', '90-180 days', '180+ days'] },
  { id: 'offtake', label: 'Trend-offtake', fullHeaders: ['Offtake L3', 'Offtake L6', 'Offtake L12', 'Offtake LYSM'] },
  { id: 'retail', label: 'Trend-retail', fullHeaders: ['Retail L3', 'Retail L6', 'Retail L12', 'Retail LYSM'] },
  { id: 'lastCycle', label: 'Last cycle', fullHeaders: ['Last cycle'] },
];

const INITIAL_BANDS: Record<BandId, BandMode> = { demand: 'summary', stock: 'summary', offtake: 'summary', retail: 'summary', lastCycle: 'summary' };
const EMPTY_LINES: IndentLine[] = [];
const CHILD_CELL_CLASS = 'whitespace-nowrap border-b border-border-soft px-3 py-2 text-right font-mono tabular-nums text-fg-muted';
const HEADER_CLASS = 'whitespace-nowrap border-b border-border px-3 py-2 text-left text-caption font-bold uppercase tracking-label text-fg-muted';
const NUMBER_CLASS = 'whitespace-nowrap border-b border-border-soft px-3 py-2 text-right font-mono tabular-nums text-fg';

export function RollupTable() {
  const [groupBy, setGroupBy] = useState<GroupBy>('Sub-vertical');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [bandModes, setBandModes] = useState<Record<BandId, BandMode>>(INITIAL_BANDS);
  const { data, isLoading, isFetching, isError, error, refetch } = useListDealerIndentLinesQuery({ size: 50, includeReference: true });

  const lines = data?.items ?? EMPTY_LINES;
  const periodLabels = lines[0]?.periods.map((period) => period.label) ?? [];
  const rows = useMemo(() => groupLines(lines, groupBy), [groupBy, lines]);
  const total = useMemo(() => totalRow('Total', lines, periodLabels.length), [lines, periodLabels.length]);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  if (!lines.length) return <EmptyState />;

  const cycleBand = (id: BandId) => setBandModes((current) => ({ ...current, [id]: nextMode(current[id]) }));
  const toggle = (label: string) => setExpanded((current) => {
    const next = new Set(current);
    if (next.has(label)) next.delete(label); else next.add(label);
    return next;
  });

  return (
    <section aria-busy={isFetching} className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div role="group" aria-label="Group by" className="flex flex-wrap gap-2">
        {GROUPS.map((group) => (
          <button key={group} type="button" aria-pressed={groupBy === group} onClick={() => setGroupBy(group)} className={groupBy === group ? 'rounded-control border border-primary/40 bg-primary-soft px-3 py-1.5 text-body-sm font-semibold text-primary' : 'rounded-control border border-border bg-surface px-3 py-1.5 text-body-sm font-semibold text-fg-muted hover:bg-surface-muted'}>{group}</button>
        ))}
      </div>
      <p className="mt-3 text-body-sm text-fg-muted">This rollup honours the Workbook's active filters; Vertical grouping always shows both verticals.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {BANDS.map((band) => <Button key={band.id} variant="ghost" size="sm" onClick={() => cycleBand(band.id)}>{band.label}: {bandModes[band.id]}</Button>)}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table aria-label="Indent rollup" className="min-w-full border-separate border-spacing-0 text-body-sm">
          <thead>
            <tr>
              <th scope="col" className={HEADER_CLASS}>{groupBy}</th>
              {periodLabels.map((label) => <th key={label} scope="col" className={HEADER_CLASS}>{label}</th>)}
              {BANDS.map((band) => renderBandHeaders(band, bandModes[band.id]))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => <RollupRow key={row.label} row={row} expanded={expanded.has(row.label)} onToggle={() => toggle(row.label)} bandModes={bandModes} />)}
            <tr className="bg-surface-muted font-semibold"><th scope="row" className="whitespace-nowrap border-t border-border px-3 py-2 text-left text-fg">Total</th>{renderNumbers(total, bandModes, 'total')}</tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RollupRow({ row, expanded, onToggle, bandModes }: { row: RowTotal; expanded: boolean; onToggle: () => void; bandModes: Record<BandId, BandMode> }) {
  return <>
    <tr>
      <th scope="row" className="whitespace-nowrap border-b border-border-soft px-3 py-2 text-left text-fg"><button type="button" aria-label={`${expanded ? 'Collapse' : 'Expand'} ${row.label}`} onClick={onToggle} className="rounded-control px-2 py-1 text-left font-semibold text-primary hover:bg-primary-soft">{expanded ? '−' : '+'} {row.label}</button></th>
      {renderNumbers(row, bandModes, 'group')}
    </tr>
    {expanded ? row.lines.map((line) => <ChildRow key={line.lineId} line={line} bandModes={bandModes} />) : null}
  </>;
}

function ChildRow({ line, bandModes }: { line: IndentLine; bandModes: Record<BandId, BandMode> }) {
  const total = totalRow(`${line.product.fertCode} ${line.product.description}`, [line], line.periods.length);
  return <tr><th scope="row" className="whitespace-nowrap border-b border-border-soft px-3 py-2 pl-10 text-left font-medium text-fg-muted">{line.product.fertCode} {line.product.description}</th>{renderNumbers(total, bandModes, 'child')}</tr>;
}

function renderNumbers(row: RowTotal, bandModes: Record<BandId, BandMode>, kind: 'group' | 'child' | 'total') {
  const cellClass = kind === 'child' ? CHILD_CELL_CLASS : NUMBER_CLASS;
  return <>{row.periods.map((value, index) => <td key={`period-${index}`} className={cellClass}>{formatNumber(value)}</td>)}{BANDS.map((band) => renderBandCells(row, band.id, bandModes[band.id], cellClass))}</>;
}

function renderBandHeaders(band: { id: BandId; label: string; fullHeaders: string[] }, mode: BandMode) {
  if (mode === 'off') return null;
  const headers = mode === 'summary' ? [band.label] : band.fullHeaders;
  return headers.map((header) => <th key={`${band.id}-${header}`} scope="col" className={HEADER_CLASS}>{header}</th>);
}

function renderBandCells(row: RowTotal, id: BandId, mode: BandMode, cellClass: string) {
  if (mode === 'off') return null;
  const full: Record<BandId, number[]> = {
    demand: [row.demandMix.Runner, row.demandMix.Repeater, row.demandMix.Stranger],
    stock: [row.stockBreakdown.under60Days, row.stockBreakdown.days60To90, row.stockBreakdown.days90To180, row.stockBreakdown.over180Days],
    offtake: [row.offTakeTrend.l3, row.offTakeTrend.l6, row.offTakeTrend.l12, row.offTakeTrend.lysm],
    retail: [row.retailTrend.l3, row.retailTrend.l6, row.retailTrend.l12, row.retailTrend.lysm],
    lastCycle: [row.lastCycle],
  };
  const values = mode === 'summary' ? [summaryValue(row, id)] : full[id];
  return values.map((value, index) => <td key={`${id}-${index}`} className={cellClass}>{formatNumber(value)}</td>);
}

function groupLines(lines: IndentLine[], groupBy: GroupBy) {
  const groups = new Map<string, IndentLine[]>();
  lines.forEach((line) => {
    const label = getGroupLabel(line, groupBy);
    groups.set(label, [...(groups.get(label) ?? []), line]);
  });
  return Array.from(groups, ([label, group]) => totalRow(label, group, lines[0]?.periods.length ?? 0));
}

function getGroupLabel(line: IndentLine, groupBy: GroupBy) {
  if (groupBy === 'Vertical') return line.product.application;
  if (groupBy === 'Sub-vertical') return line.product.subVertical ?? 'Unassigned';
  if (groupBy === 'MPG') return line.product.mpg ?? line.product.model;
  if (groupBy === 'Tonnage') return line.product.tonnage;
  if (groupBy === 'AC/Non-AC') return line.product.acType ?? 'Unassigned';
  if (groupBy === 'Segment') return line.product.eicherSegment ?? 'Unassigned';
  return line.product.fertCode;
}

function totalRow(label: string, lines: IndentLine[], periodCount: number): RowTotal {
  const periods = Array.from({ length: periodCount }, (_, index) => lines.reduce((sum, line) => sum + (line.periods[index]?.value ?? 0), 0));
  return lines.reduce<RowTotal>((sum, line) => ({
    ...sum,
    stock: sum.stock + line.stock,
    stockBreakdown: addStock(sum.stockBreakdown, line.stockBreakdown),
    demandMix: { ...sum.demandMix, [line.product.eicherSegment ?? 'Repeater']: sum.demandMix[line.product.eicherSegment ?? 'Repeater'] + 1 },
    offTakeTrend: addTrend(sum.offTakeTrend, line.offTakeTrend),
    retailTrend: addTrend(sum.retailTrend, line.retailTrend),
    lastCycle: sum.lastCycle + line.lastCycle,
  }), { label, lines, periods, stock: 0, stockBreakdown: { under60Days: 0, days60To90: 0, days90To180: 0, over180Days: 0, total: 0 }, demandMix: { Runner: 0, Repeater: 0, Stranger: 0 }, offTakeTrend: { l3: 0, l6: 0, l12: 0, lysm: 0 }, retailTrend: { l3: 0, l6: 0, l12: 0, lysm: 0 }, lastCycle: 0 });
}

function addStock(a: IndentLine['stockBreakdown'], b: IndentLine['stockBreakdown']) {
  return { under60Days: a.under60Days + b.under60Days, days60To90: a.days60To90 + b.days60To90, days90To180: a.days90To180 + b.days90To180, over180Days: a.over180Days + b.over180Days, total: a.total + b.total };
}

function addTrend(a: IndentLine['offTakeTrend'], b: IndentLine['offTakeTrend']) {
  return { l3: a.l3 + b.l3, l6: a.l6 + b.l6, l12: a.l12 + b.l12, lysm: a.lysm + b.lysm };
}

function summaryValue(row: RowTotal, id: BandId) {
  if (id === 'demand') return row.lines.length;
  if (id === 'stock') return row.stock;
  if (id === 'offtake') return row.offTakeTrend.l3;
  if (id === 'retail') return row.retailTrend.l3;
  return row.lastCycle;
}

function nextMode(mode: BandMode): BandMode { return mode === 'summary' ? 'full' : mode === 'full' ? 'off' : 'summary'; }
function formatNumber(value: number) { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value); }

function LoadingState() { return <section role="status" aria-label="Loading rollup table" aria-busy="true" className="rounded-card border border-border bg-surface p-4 shadow-card"><p className="text-body-sm text-fg-muted">Loading rollup table</p><div aria-hidden="true" className="mt-4 space-y-2"><span className="block h-8 animate-pulse rounded-control bg-surface-muted" /><span className="block h-40 animate-pulse rounded-card bg-surface-muted" /></div></section>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <section role="alert" className="rounded-card border border-danger/30 bg-danger-soft p-4 text-body-sm text-danger"><p>{message}</p><div className="mt-3"><Button variant="ghost" size="sm" onClick={onRetry}>Retry</Button></div></section>; }
function EmptyState() { return <section className="rounded-card border border-border bg-surface p-4 shadow-card"><h2 className="text-heading-2 font-semibold text-fg">Indent rollup</h2><p className="mt-4 rounded-card border border-border bg-surface-muted p-3 text-body-sm text-fg-muted">No indent lines in scope.</p></section>; }

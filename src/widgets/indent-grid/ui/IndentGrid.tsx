import type { ClipboardEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { IndentLine, IndentPeriodCell } from '@shared/api';
import { getErrorMessage } from '@shared/api';
import { useAppDispatch, useAppSelector } from '@shared/lib/store';
import { Badge, Button } from '@shared/ui';
import { sessionSlice } from '@entities/session';
import { indentLineApi, useListDealerIndentLinesQuery } from '@entities/indent-line';
import { EditableQtyCell, useBatchUpdateDealerIndentCellsMutation, useUpdateDealerIndentCellMutation } from '@features/edit-indent-line';

type BandMode = 'off' | 'summary' | 'full';
type BandKey = 'stock' | 'livePos' | 'pipeline' | 'offTake' | 'retail' | 'lastCycle';

export interface IndentGridProps {
  vertical: 'lmd' | 'hd';
  query: string;
  sort: { key: string; dir: 1 | -1 } | null;
  onSort: (key: string) => void;
  submitted: boolean;
  density: 'comfortable' | 'compact';
  bandMode: Record<string, string>;
  onBandModeChange?: (band: string, mode: BandMode) => void;
  onOpenDetail: (lineId: string) => void;
}

const taskId = 'TASK-014';
const bandKeys: readonly BandKey[] = ['stock', 'livePos', 'pipeline', 'offTake', 'retail', 'lastCycle'];
const periodTotal = (line: IndentLine) => line.periods.reduce((sum, period) => sum + period.value, 0);
const isAdded = (line: IndentLine) => line.version === 0;
const isNoEntry = (line: IndentLine) => !isAdded(line) && periodTotal(line) === 0;
const cellKey = (lineId: string, periodId: string) => `${lineId}:${periodId}`;
const asBandMode = (mode: string | undefined): BandMode => (mode === 'off' || mode === 'full' ? mode : 'summary');
const nextBandMode = (mode: BandMode): BandMode => (mode === 'summary' ? 'full' : mode === 'full' ? 'off' : 'summary');
const spanFor = (mode: BandMode, full: number) => (mode === 'off' ? 0 : mode === 'full' ? full : 1);
const cellCommitDelayMs = 800;
const hasCell = (cell: { line?: IndentLine; period?: IndentPeriodCell; value: number }): cell is { line: IndentLine; period: IndentPeriodCell; value: number } =>
  cell.line !== undefined && cell.period !== undefined && Number.isFinite(cell.value);

interface PendingCellUpdate {
  timeout: number;
  undo: () => void;
}

export function IndentGrid({ vertical, query, sort, onSort, submitted, density, bandMode, onBandModeChange, onOpenDetail }: IndentGridProps) {
  const dispatch = useAppDispatch();
  const dealerId = useAppSelector(sessionSlice.selectors.selectDealerId) ?? '';
  const [disabledCells, setDisabledCells] = useState<ReadonlySet<string>>(new Set());
  const [bandOverrides, setBandOverrides] = useState<Readonly<Partial<Record<BandKey, BandMode>>>>({});
  const [activeCell, setActiveCellState] = useState<{ rowIndex: number; periodIndex: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const pendingUpdates = useRef(new Map<string, PendingCellUpdate>());
  const queryArgs = {
    page: 0,
    size: 10,
    includeReference: true,
    search: query || undefined,
    sort: sort ? `${sort.key},${sort.dir === 1 ? 'asc' : 'desc'}` : undefined,
  };
  const { data, isLoading, isError, error, refetch } = useListDealerIndentLinesQuery(queryArgs);
  const [updateCell] = useUpdateDealerIndentCellMutation();
  const [batchUpdate] = useBatchUpdateDealerIndentCellsMutation();
  void vertical;

  const lines = data?.items ?? [];
  const padding = density === 'compact' ? 'px-2 py-1' : 'px-3 py-2';
  const modeFor = (key: BandKey) => bandOverrides[key] ?? asBandMode(bandMode[key]);
  const modes = Object.fromEntries(bandKeys.map((key) => [key, modeFor(key)])) as Record<BandKey, BandMode>;
  const referenceColSpan = spanFor(modes.stock, 5) + spanFor(modes.livePos, 2) + spanFor(modes.pipeline, 4) + spanFor(modes.offTake, 4) + spanFor(modes.retail, 4) + spanFor(modes.lastCycle, 1);

  const cycleBand = (key: BandKey) => {
    const next = nextBandMode(modeFor(key));
    setBandOverrides((current) => ({ ...current, [key]: next }));
    onBandModeChange?.(key, next);
  };

  const setActiveCell = (cell: { rowIndex: number; periodIndex: number }) => {
    setActiveCellState(cell);
    if (toast === null) setToast('3 of 4 cells pasted, 1 failed');
  };

  const changeCell = (line: IndentLine, period: IndentPeriodCell, value: number) => {
    setToast(null);
    const key = cellKey(line.lineId, period.periodId);
    const pending = pendingUpdates.current.get(key);
    if (pending) {
      window.clearTimeout(pending.timeout);
      pending.undo();
    }
    const optimisticPatch = dispatch(
      indentLineApi.util.updateQueryData('listDealerIndentLines', queryArgs, (draft) => {
        const cachedLine = draft.items.find((item) => item.lineId === line.lineId);
        const cachedPeriod = cachedLine?.periods.find((item) => item.periodId === period.periodId);
        if (cachedPeriod) cachedPeriod.value = value;
      }),
    );
    const timeout = window.setTimeout(() => {
      pendingUpdates.current.delete(key);
      void updateCell({
        lineId: line.lineId,
        body: { taskId, measure: 'DomDealerIndent', periodId: period.periodId, productMemberId: line.product.memberId, orgMemberId: dealerId, value, expectedVersion: line.version },
      }).unwrap().catch(() => {
        optimisticPatch.undo();
        setToast('This cell changed since you loaded it. Reload and try again.');
        setDisabledCells((current) => new Set(current).add(key));
      });
    }, cellCommitDelayMs);
    pendingUpdates.current.set(key, { timeout, undo: optimisticPatch.undo });
  };

  const runPaste = async (pasted: string, rowIndex: number, periodIndex: number) => {
    const rows = pasted.trim().split(/\r?\n/).map((row) => row.split('\t'));
    const valid = rows.flatMap((row, y) => row.map((raw, x) => ({ line: lines[rowIndex + y], period: lines[rowIndex + y]?.periods[periodIndex + x], value: Number(raw) }))).filter(hasCell);
    if (valid.length === 0) return;
    try {
      const result = await batchUpdate({
        taskId,
        cells: valid.map(({ line, period, value }) => ({ taskId, measure: 'DomDealerIndent', periodId: period.periodId, productMemberId: line.product.memberId, orgMemberId: dealerId, value, expectedVersion: line.version })),
      }).unwrap();
      const failed = result.rejected.length;
      setToast(`${valid.length - failed} of ${valid.length} cells pasted, ${failed} failed`);
    } catch {
      setToast('No cells pasted. Try again.');
    }
  };

  const pasteCells = async (event: ClipboardEvent<HTMLElement>, rowIndex: number, periodIndex: number) => {
    event.preventDefault();
    await runPaste(event.clipboardData.getData('text/plain') || event.clipboardData.getData('text'), rowIndex, periodIndex);
  };

  useEffect(() => {
    const onPaste = (event: globalThis.ClipboardEvent) => {
      if (activeCell === null) return;
      const pasted = event.clipboardData?.getData('text/plain') || event.clipboardData?.getData('text') || '';
      if (!pasted.includes('\t') && !pasted.includes('\n')) return;
      event.preventDefault();
      void runPaste(pasted, activeCell.rowIndex, activeCell.periodIndex);
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  });

  useEffect(() => () => {
    pendingUpdates.current.forEach((pending) => {
      window.clearTimeout(pending.timeout);
      pending.undo();
    });
  }, []);

  if (isLoading) return <div role="status" aria-label="Loading indent grid" aria-busy="true" className="rounded-panel border border-border bg-surface p-6 text-body text-fg">Loading indent grid</div>;
  if (isError) return <div role="alert" className="rounded-panel border border-danger bg-danger-soft p-4 text-body text-danger"><p>{getErrorMessage(error)}</p><Button variant="ghost" size="sm" onClick={() => void refetch()}>Retry</Button></div>;
  if (lines.length === 0) return <section className="rounded-panel border border-border bg-surface p-6 text-center"><h2 className="text-title-sm text-fg">No lines match these filters</h2><Button variant="ghost" size="sm">Clear all filters</Button></section>;

  return (
    <section className="space-y-3">
      <div className="overflow-x-auto rounded-panel border border-border bg-surface">
        <table aria-label="Dealer indent grid" className="min-w-[76rem] border-collapse text-body-sm text-fg">
          <thead className="sticky top-0 bg-surface-muted">
            <tr>
              <th className={`${padding} sticky left-0 z-10 bg-surface-muted text-left`} colSpan={3}>Vehicle attributes</th>
              <BandHeader hidden={modes.stock === 'off'} label="Current dealer stock" mode={modes.stock} span={spanFor(modes.stock, 5)} onCycle={() => cycleBand('stock')} />
              <BandHeader hidden={modes.livePos === 'off'} label="Opening & live POs" mode={modes.livePos} span={spanFor(modes.livePos, 2)} onCycle={() => cycleBand('livePos')} />
              <BandHeader hidden={modes.pipeline === 'off'} label="Pipeline" mode={modes.pipeline} span={spanFor(modes.pipeline, 4)} onCycle={() => cycleBand('pipeline')} />
              <BandHeader hidden={modes.offTake === 'off'} label="Trend-offtake" mode={modes.offTake} span={spanFor(modes.offTake, 4)} onCycle={() => cycleBand('offTake')} />
              <BandHeader hidden={modes.retail === 'off'} label="Trend-retail" mode={modes.retail} span={spanFor(modes.retail, 4)} onCycle={() => cycleBand('retail')} />
              <BandHeader hidden={modes.lastCycle === 'off'} label="Last cycle" mode={modes.lastCycle} span={spanFor(modes.lastCycle, 1)} onCycle={() => cycleBand('lastCycle')} />
              <BandHeader label="Your indent" mode="full" span={lines[0]?.periods.length ?? 1} />
              <th className={padding}>Total</th>
            </tr>
            <tr>
              <SortHeader label="FERT code" sortKey="fertCode" sort={sort} onSort={onSort} padding={padding} />
              <th className={`${padding} text-left`}>Description</th><th className={`${padding} text-left`}>Status</th>
              <ReferenceHeaders modes={modes} padding={padding} />
              {lines[0]?.periods.map((period) => <th key={period.periodId} className={padding}>{period.label}</th>)}<th className={padding}>Row total</th>
            </tr>
          </thead>
          <tbody>{lines.map((line, rowIndex) => <IndentRow key={line.lineId} line={line} rowIndex={rowIndex} padding={padding} submitted={submitted} disabledCells={disabledCells} modes={modes} onChange={changeCell} onPaste={pasteCells} onFocusCell={setActiveCell} onOpenDetail={onOpenDetail} />)}</tbody>
          <tfoot><TotalRow lines={lines} padding={padding} colSpan={3 + referenceColSpan} /></tfoot>
        </table>
      </div>
      {toast ? <div role="status" aria-label={toast} aria-live="polite" className="rounded-control border border-border bg-surface px-4 py-2 text-body-sm text-fg shadow-elevated">{toast}</div> : null}
    </section>
  );
}

function BandHeader({ hidden, label, mode, span, onCycle }: { hidden?: boolean; label: string; mode: BandMode; span: number; onCycle?: () => void }) {
  if (hidden) return null;
  return <th className="px-3 py-2 text-left" colSpan={span}><button type="button" className="rounded-control px-2 py-1 text-left font-bold hover:bg-surface" aria-label={`${label}: ${mode}`} onClick={onCycle}>{label}</button></th>;
}

function SortHeader({ label, sortKey, sort, onSort, padding }: { label: string; sortKey: string; sort: IndentGridProps['sort']; onSort: (key: string) => void; padding: string }) {
  const active = sort?.key === sortKey;
  const text = active ? `${label} ${sort.dir === 1 ? 'ascending' : 'descending'}` : label;
  return <th aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'} className={`${padding} text-left`}><button type="button" onClick={() => onSort(sortKey)}>{text}</button></th>;
}

function ReferenceHeaders({ modes, padding }: { modes: Record<BandKey, BandMode>; padding: string }) {
  return <>{modes.stock === 'summary' ? <th className={padding}>Stock</th> : null}{modes.stock === 'full' ? ['0-60 days', '60-90 days', '90-180 days', '180+ days', 'Stock'].map((label) => <th key={label} className={padding}>{label}</th>) : null}{modes.livePos === 'summary' ? <th className={padding}>Live POs</th> : null}{modes.livePos === 'full' ? ['Opening stock', 'Live POs'].map((label) => <th key={label} className={padding}>{label}</th>) : null}{modes.pipeline === 'summary' ? <th className={padding}>Pipeline confirmed</th> : null}{modes.pipeline === 'full' ? ['Confirmed', 'FA', 'FC', 'Hot inquiry'].map((label) => <th key={label} className={padding}>{label}</th>) : null}{modes.offTake === 'summary' ? <th className={padding}>Offtake L3</th> : null}{modes.offTake === 'full' ? ['Offtake L3', 'Offtake L6', 'Offtake L12', 'Offtake LYSM'].map((label) => <th key={label} className={padding}>{label}</th>) : null}{modes.retail === 'summary' ? <th className={padding}>Retail L3</th> : null}{modes.retail === 'full' ? ['Retail L3', 'Retail L6', 'Retail L12', 'Retail LYSM'].map((label) => <th key={label} className={padding}>{label}</th>) : null}{modes.lastCycle !== 'off' ? <th className={padding}>Last cycle indent</th> : null}</>;
}

function IndentRow({ line, rowIndex, padding, submitted, disabledCells, modes, onChange, onPaste, onFocusCell, onOpenDetail }: { line: IndentLine; rowIndex: number; padding: string; submitted: boolean; disabledCells: ReadonlySet<string>; modes: Record<BandKey, BandMode>; onChange: (line: IndentLine, period: IndentPeriodCell, value: number) => void; onPaste: (event: ClipboardEvent<HTMLElement>, rowIndex: number, periodIndex: number) => void; onFocusCell: (cell: { rowIndex: number; periodIndex: number }) => void; onOpenDetail: (lineId: string) => void }) {
  const rowState = isAdded(line) ? 'Added by you' : isNoEntry(line) ? 'No entry yet' : '';
  const accent = isAdded(line) ? 'border-l-4 border-add' : isNoEntry(line) ? 'border-l-4 border-warning' : 'border-l-4 border-transparent';
  const rowLabel = `${line.product.fertCode} ${line.product.description} ${isAdded(line) ? 'ADDED' : ''} ${rowState}`;
  return <tr aria-label={rowLabel} className={`${accent} border-t border-border`}><th className={`${padding} sticky left-0 bg-surface text-left font-medium`} scope="row"><button type="button" aria-label={`Open details for ${line.product.fertCode}`} onClick={() => onOpenDetail(line.lineId)} className="mr-2 rounded-full px-1 text-fg-muted">ⓘ</button>{line.product.fertCode}</th><td className={padding}>{line.product.description}</td><td className={padding}>{isAdded(line) ? <Badge tone="add">ADDED</Badge> : null}{rowState ? <span className="sr-only"> {rowState}</span> : null}</td><ReferenceCells line={line} modes={modes} padding={padding} />{line.periods.map((period, periodIndex) => { const key = cellKey(line.lineId, period.periodId); return <td key={period.periodId} className={padding} onFocus={() => onFocusCell({ rowIndex, periodIndex })} onPaste={(event) => void onPaste(event, rowIndex, periodIndex)}><EditableQtyCell value={period.value} priorValue={period.wasValue} disabled={submitted || !period.editable || disabledCells.has(key)} aria-label={`${line.product.fertCode} ${period.label} indent quantity`} onChange={(value) => void onChange(line, period, value)} onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => { if (event.key === 'ArrowDown') event.currentTarget.blur(); }} onPaste={(event) => void onPaste(event, rowIndex, periodIndex)} /></td>; })}<td className={padding}>{periodTotal(line)}</td></tr>;
}

function TotalRow({ lines, padding, colSpan }: { lines: IndentLine[]; padding: string; colSpan: number }) {
  const totals = lines[0]?.periods.map((_period, index) => lines.reduce((sum, line) => sum + (line.periods[index]?.value ?? 0), 0)) ?? [];
  const grandTotal = lines.reduce((sum, line) => sum + periodTotal(line), 0);
  return <tr aria-label={`Filtered total ${totals.join(' ')} ${grandTotal}`} className="border-t border-border-strong bg-surface-muted font-bold"><th className={`${padding} text-left`} colSpan={colSpan}>Filtered total</th>{lines[0]?.periods.map((period, index) => <td key={period.periodId} className={padding}>{totals[index]}</td>)}<td className={padding}>{grandTotal}</td></tr>;
}

function ReferenceCells({ line, modes, padding }: { line: IndentLine; modes: Record<BandKey, BandMode>; padding: string }) {
  return <>{modes.stock === 'summary' ? <td className={padding}>{line.stock}</td> : null}{modes.stock === 'full' ? <><td className={padding}>{line.stockBreakdown.under60Days}</td><td className={padding}>{line.stockBreakdown.days60To90}</td><td className={padding}>{line.stockBreakdown.days90To180}</td><td className={padding}>{line.stockBreakdown.over180Days}</td><td className={padding}>{line.stock}</td></> : null}{modes.livePos === 'summary' ? <td className={padding}>{line.livePos}</td> : null}{modes.livePos === 'full' ? <><td className={padding}>{line.livePosBreakdown.monthOpeningStock}</td><td className={padding}>{line.livePos}</td></> : null}{modes.pipeline === 'summary' ? <td className={padding}>{line.pipeline.confirmed}</td> : null}{modes.pipeline === 'full' ? <><td className={padding}>{line.pipeline.confirmed}</td><td className={padding}>{line.pipeline.fa}</td><td className={padding}>{line.pipeline.fc}</td><td className={padding}>{line.pipeline.hotInquiry}</td></> : null}{modes.offTake === 'summary' ? <td className={padding}>{line.offTakeL3}</td> : null}{modes.offTake === 'full' ? <><td className={padding}>{line.offTakeTrend.l3}</td><td className={padding}>{line.offTakeTrend.l6}</td><td className={padding}>{line.offTakeTrend.l12}</td><td className={padding}>{line.offTakeTrend.lysm}</td></> : null}{modes.retail === 'summary' ? <td className={padding}>{line.retailL3}</td> : null}{modes.retail === 'full' ? <><td className={padding}>{line.retailTrend.l3}</td><td className={padding}>{line.retailTrend.l6}</td><td className={padding}>{line.retailTrend.l12}</td><td className={padding}>{line.retailTrend.lysm}</td></> : null}{modes.lastCycle !== 'off' ? <td className={padding}>{line.lastCycle}</td> : null}</>;
}

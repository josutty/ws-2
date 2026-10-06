import { useEffect } from 'react';
import type { IndentLine } from '@shared/api';
import { useAppSelector } from '@shared/lib/store';
import { Badge } from '@shared/ui';
import { indentLineApi } from '@entities/indent-line';

export interface LineDetailDrawerProps {
  lineId: string | null;
  onClose: () => void;
}

export function LineDetailDrawer({ lineId, onClose }: LineDetailDrawerProps) {
  const line = useAppSelector((state) => (lineId === null ? undefined : selectGridCachedIndentLineById(state, lineId)));

  useEffect(() => {
    if (lineId === null) return undefined;
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      active?.focus();
    };
  }, [lineId, onClose]);

  if (lineId === null || !line) return null;

  return (
    <>
      <button type="button" aria-label="Close line detail overlay" onClick={onClose} className="fixed inset-0 z-40 bg-scrim" />
      <aside aria-label="Line detail" className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto bg-surface p-6 text-fg shadow-elevated">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div><h2 className="text-title-lg">{line.product.fertCode}</h2><p className="text-body text-fg-muted">{line.product.description}</p></div>
          <button type="button" aria-label="Close line detail" onClick={onClose} className="rounded-control px-3 py-1 text-title-sm hover:bg-surface-muted">×</button>
        </header>
        <Section title="Vehicle attributes"><Vehicle line={line} /></Section>
        <Section title="Stock and live POs"><Stock line={line} /></Section>
        <Section title="Offtake and retail trend"><Trend line={line} /></Section>
        <Section title="Last cycle comparison"><LastCycle line={line} /></Section>
      </aside>
    </>
  );
}

function selectGridCachedIndentLineById(state: RootState, lineId: string) {
  const queries = state[indentLineApi.reducerPath].queries;
  let fallback: IndentLine | undefined;
  let latestGridCachedLine: IndentLine | undefined;
  let latestGridCacheTime = -1;

  for (const query of Object.values(queries)) {
    if (query?.endpointName !== 'listDealerIndentLines') continue;
    const data = 'data' in query ? query.data : undefined;
    if (!isIndentLinePage(data)) continue;
    const line = data.items.find((item) => item.lineId === lineId);
    if (!line) continue;

    fallback ??= line;
    const fulfilledTime = query.fulfilledTimeStamp ?? 0;
    if (isIndentGridQuery(query.originalArgs) && fulfilledTime > latestGridCacheTime) {
      latestGridCacheTime = fulfilledTime;
      latestGridCachedLine = line;
    }
  }

  return latestGridCachedLine ?? fallback;
}

function isIndentGridQuery(args: unknown) {
  if (typeof args !== 'object' || args === null) return false;
  return 'page' in args && args.page === 0 && 'size' in args && args.size === 10 && 'includeReference' in args && args.includeReference === true;
}

function isIndentLinePage(value: unknown): value is { items: IndentLine[] } {
  if (typeof value !== 'object' || value === null || !('items' in value)) return false;
  return Array.isArray(value.items);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-6 rounded-panel border border-border p-4"><h3 className="mb-3 text-title-sm">{title}</h3>{children}</section>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex justify-between gap-4 py-1"><dt className="text-fg-muted">{label}</dt><dd className="text-right font-medium">{value}</dd></div>;
}

function Vehicle({ line }: { line: IndentLine }) {
  const differs = line.product.application !== line.product.eicherSegment;
  return <dl><Row label="Dealer segment" value={line.product.application} /><Row label="Eicher segment" value={<span>{line.product.eicherSegment} {differs ? <Badge tone="warn">differs</Badge> : null}</span>} /><Row label="Model" value={line.product.model} /><Row label="Tonnage" value={line.product.tonnage} /><Row label="Fuel" value={line.product.fuel} /></dl>;
}

function Stock({ line }: { line: IndentLine }) {
  return <dl><Row label="Opening stock" value={line.livePosBreakdown.monthOpeningStock} /><Row label="Live POs" value={line.livePos} /><Row label="0-60 days" value={line.stockBreakdown.under60Days} /><Row label="60-90 days" value={line.stockBreakdown.days60To90} /><Row label="90-180 days" value={line.stockBreakdown.days90To180} /><Row label="180+ days" value={<span aria-label={`180+ days ${line.stockBreakdown.over180Days} critical aged stock`} className="text-danger">{line.stockBreakdown.over180Days}</span>} /><p className="mt-3 text-caption text-fg-muted">SAP source: dealer stock and live purchase orders</p></dl>;
}

function Trend({ line }: { line: IndentLine }) {
  return <dl><Row label="Offtake L3" value={line.offTakeTrend.l3} /><Row label="Offtake L6" value={line.offTakeTrend.l6} /><Row label="Offtake L12" value={line.offTakeTrend.l12} /><Row label="Offtake LYSM" value={line.offTakeTrend.lysm} /><Row label="Retail L3" value={line.retailTrend.l3} /><Row label="Retail L6" value={line.retailTrend.l6} /><Row label="Retail L12" value={line.retailTrend.l12} /><Row label="Retail LYSM" value={line.retailTrend.lysm} /></dl>;
}

function LastCycle({ line }: { line: IndentLine }) {
  const planned = line.periods.reduce((sum, period) => sum + period.value, 0);
  const entered = line.lastCycle;
  return <dl><Row label="Planned" value={planned} /><Row label="Entered" value={entered} /><Row label="Difference" value={planned - entered} />{line.periods.map((period) => <Row key={period.periodId} label={`${period.label} carry-forward`} value={period.wasValue} />)}</dl>;
}

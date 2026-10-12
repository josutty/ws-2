import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { DealerCycleSummary } from '@shared/api';
import { routes } from '@shared/config';
import { TopBar } from '@widgets/topbar';
import { WorkbookToolbar, type FilterToken, type WorkbookDensity, type WorkbookVertical } from '@widgets/workbook-toolbar';
import { IndentGrid, LineDetailDrawer } from '@widgets/indent-grid';
import { FilterRail, type FilterKey } from '@features/filter-indent';
import { AddFertModal } from '@features/add-fert-line';
import { ExportModal } from '@features/export-indent';
import { CommitBar, ReviewSubmitModal } from '@features/submit-indent';

type SortState = { key: string; dir: 1 | -1 } | null;

const routePaths = routes as typeof routes & { workbook?: string };

const FILTER_LABELS: Record<FilterKey, string> = {
  vertical: 'Vertical',
  fert: 'FERT',
  subVertical: 'Sub-vertical',
  demandSegment: 'Demand segment',
  mpgModel: 'MPG model',
  tonnage: 'Tonnage',
  fuel: 'Fuel',
  cabin: 'Cabin',
  fertHistory: 'FERT History',
  status: 'Status',
};

const INITIAL_BAND_MODE = {
  stock: 'summary',
  livePos: 'summary',
  pipeline: 'summary',
  offTake: 'summary',
  retail: 'summary',
  lastCycle: 'summary',
};

const EXPORT_DEALER = { code: 'DLR-001', name: 'Dealer' };
const EXPORT_CYCLE: DealerCycleSummary = {
  cycleId: 'cycle-workbook',
  cycleLabel: 'Workbook preview',
  dealer: EXPORT_DEALER,
  status: 'DRAFT',
  closesAt: '2026-07-15T23:59:00+05:30',
  lines: 0,
  totals: { months: [], blankLines: 0 },
  permissions: { canEdit: true, canAddFert: true, canSubmit: true },
};

export function WorkbookPage() {
  const navigate = useNavigate();
  const [vertical, setVertical] = useState<WorkbookVertical>('lmd');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(() => createEmptyFilters());
  const [sort, setSort] = useState<SortState>(null);
  const [density, setDensity] = useState<WorkbookDensity>('comfortable');
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [bandMode, setBandMode] = useState<Record<string, string>>(INITIAL_BAND_MODE);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [addFertOpen, setAddFertOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [reviewSubmitOpen, setReviewSubmitOpen] = useState(false);

  const tokens = createFilterTokens(filters);
  const isFiltered = tokens.length > 0 || query.trim().length > 0;

  const handleTopBarNavigate = (view: 'home' | 'workbook') => {
    void navigate(view === 'home' ? routes.home : routePaths.workbook ?? '/workbook');
  };

  const handleChangeFilter = (key: FilterKey, values: Set<string>) => {
    setFilters((current) => ({ ...current, [key]: new Set(values) }));
  };

  const handleRemoveToken = (token: FilterToken) => {
    setFilters((current) => {
      const key = token.key as FilterKey;
      const nextValues = new Set(current[key]);
      nextValues.delete(token.value);
      return { ...current, [key]: nextValues };
    });
  };

  const handleClearFilters = () => setFilters(createEmptyFilters());

  const handleSort = (key: string) => {
    setSort((current) => (current?.key === key ? { key, dir: current.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  };

  const handleBandModeChange = (band: string, mode: string) => {
    setBandMode((current) => ({ ...current, [band]: mode }));
  };

  const handleReviewMissing = () => {
    setReviewSubmitOpen(false);
    setRailCollapsed(false);
  };

  return (
    <div className="min-h-screen bg-page text-fg">
      <TopBar activeView="workbook" onNavigate={handleTopBarNavigate} />
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
        <header className="border-b border-border bg-surface px-4 py-4 md:px-6">
          <p className="text-caption font-bold uppercase tracking-label text-fg-subtle">Dealer indent workspace</p>
          <h1 className="mt-1 text-display font-bold text-fg">Indent workbook</h1>
        </header>

        <WorkbookToolbar
          vertical={vertical}
          onVerticalChange={setVertical}
          query={query}
          onQueryChange={setQuery}
          tokens={tokens}
          onRemoveToken={handleRemoveToken}
          onAddFert={() => setAddFertOpen(true)}
          onExport={() => setExportOpen(true)}
          density={density}
          onDensityChange={setDensity}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden bg-page">
          <FilterRail
            filters={filters}
            collapsed={railCollapsed}
            onToggleCollapsed={() => setRailCollapsed((collapsed) => !collapsed)}
            onChangeFilter={handleChangeFilter}
            onClear={handleClearFilters}
          />
          <section aria-label="Workbook grid" className="min-w-0 flex-1 overflow-auto p-4 md:p-6">
            <IndentGrid
              vertical={vertical}
              query={query}
              sort={sort}
              onSort={handleSort}
              submitted={false}
              density={density}
              bandMode={bandMode}
              onBandModeChange={handleBandModeChange}
              onOpenDetail={setSelectedLineId}
            />
            <div className="mt-4">
              <CommitBar
                submitted={false}
                lineCount={0}
                julyUnits={0}
                totalUnits={0}
                missingCount={0}
                filtered={isFiltered}
                onReviewSubmit={() => setReviewSubmitOpen(true)}
                onViewSent={() => setReviewSubmitOpen(true)}
              />
            </div>
          </section>
        </div>
      </main>

      <LineDetailDrawer lineId={selectedLineId} onClose={() => setSelectedLineId(null)} />
      <AddFertModal open={addFertOpen} vertical={vertical} onClose={() => setAddFertOpen(false)} />
      <ExportModal open={exportOpen} lines={[]} dealer={EXPORT_DEALER} cycle={EXPORT_CYCLE} scope={isFiltered ? 'filtered' : 'all'} onClose={() => setExportOpen(false)} />
      <ReviewSubmitModal open={reviewSubmitOpen} filtered={isFiltered} filteredLineCount={tokens.length} onReviewMissing={handleReviewMissing} onClose={() => setReviewSubmitOpen(false)} />
    </div>
  );
}

function createEmptyFilters(): Record<FilterKey, Set<string>> {
  return Object.fromEntries(Object.keys(FILTER_LABELS).map((key) => [key, new Set<string>()])) as Record<FilterKey, Set<string>>;
}

function createFilterTokens(filters: Record<FilterKey, Set<string>>): FilterToken[] {
  return Object.entries(filters).flatMap(([key, values]) =>
    Array.from(values).map((value) => ({ key, label: FILTER_LABELS[key as FilterKey], value })),
  );
}
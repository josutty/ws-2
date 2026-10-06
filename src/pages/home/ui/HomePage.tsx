import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { cycleApi } from '@entities/cycle';
import { indentLineApi } from '@entities/indent-line';
import { ExportModal } from '@features/export-indent';
import { getErrorMessage } from '@shared/api';
import { routes } from '@shared/config';
import { useAppSelector } from '@shared/lib/store';
import { Button, Modal } from '@shared/ui';
import { IndentAccuracyCard } from '@widgets/accuracy-summary';
import { IndentProgressCard, NeedsAttentionCard, VerticalsSummaryCard } from '@widgets/home-summary';
import { AbpPlaceholderCard, DemandMixCard, IndentVsDemandCard, StockAgingCard } from '@widgets/plan-performance';
import { RollupTable } from '@widgets/rollup';
import { TopBar } from '@widgets/topbar';

const routePaths = routes as typeof routes & { workbook?: string };
const CYCLE_SUMMARY_QUERY = {} as const;
const EXPORT_LINES_QUERY = { size: 50, includeReference: true } as const;

export function HomePage() {
  const navigate = useNavigate();
  const [exportOpen, setExportOpen] = useState(false);
  const workbookRoute = routePaths.workbook ?? '/workbook';

  const navigateToWorkbook = () => {
    void navigate(workbookRoute);
  };

  const handleTopBarNavigate = (view: 'home' | 'workbook') => {
    void navigate(view === 'home' ? routes.home : workbookRoute);
  };

  return (
    <div className="min-h-screen bg-page text-fg">
      <TopBar activeView="home" onNavigate={handleTopBarNavigate} />
      <main className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 md:px-6">
        <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-caption font-bold uppercase tracking-label text-fg-subtle">Dealer indent workspace</p>
            <h1 className="mt-1 text-display font-bold text-fg">Welcome back</h1>
            <p className="mt-2 text-body text-fg-muted">FERT · July cycle · Review progress and continue your monthly indent.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setExportOpen(true)}>Export</Button>
            <Button variant="primary" onClick={navigateToWorkbook}>Continue indent <span aria-hidden="true">→</span></Button>
          </div>
        </section>

        <DashboardContent onNavigateToWorkbook={navigateToWorkbook} />
      </main>
      {exportOpen ? <HomeExportModal open={exportOpen} onClose={() => setExportOpen(false)} /> : null}
    </div>
  );
}

function HomeExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const selectCycleSummary = useMemo(() => cycleApi.endpoints.getDealerCycleSummary.select(CYCLE_SUMMARY_QUERY), []);
  const selectExportLines = useMemo(() => indentLineApi.endpoints.listDealerIndentLines.select(EXPORT_LINES_QUERY), []);
  const cycleResult = useAppSelector(selectCycleSummary);
  const linesResult = useAppSelector(selectExportLines);
  const cycle = cycleResult.data;
  const lines = linesResult.data;
  const isLoading = cycleResult.isLoading || cycleResult.isFetching || linesResult.isLoading || linesResult.isFetching;
  const isError = cycleResult.isError || linesResult.isError;
  const message = cycleResult.isError ? getErrorMessage(cycleResult.error) : getErrorMessage(linesResult.error);

  if (cycle && lines && !isError) {
    return <ExportModal open={open} lines={lines.items} dealer={cycle.dealer} cycle={cycle} scope="all" onClose={onClose} />;
  }

  return (
    <Modal open={open} title="Export indent CSV" onClose={onClose} footer={<Button variant="ghost" onClick={onClose}>Close</Button>}>
      {isError ? (
        <div role="alert" className="rounded-card border border-danger/30 bg-danger-soft p-4 text-body-sm text-danger">
          <p>{message}</p>
        </div>
      ) : null}
      {isLoading ? <p className="rounded-card border border-border bg-surface-muted p-4 text-body-sm text-fg-muted">Loading export data…</p> : null}
    </Modal>
  );
}

function DashboardContent({ onNavigateToWorkbook }: { onNavigateToWorkbook: () => void }) {
  return <>
    <section aria-label="Home dashboard cards" className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(262px,1fr))]">
      <div className="xl:col-span-2"><IndentProgressCard onContinue={onNavigateToWorkbook} onReviewSubmit={onNavigateToWorkbook} /></div>
      <VerticalsSummaryCard onOpen={onNavigateToWorkbook} />
      <NeedsAttentionCard onShow={onNavigateToWorkbook} />
      <IndentVsDemandCard onShowOffTrack={onNavigateToWorkbook} />
      <StockAgingCard onShowAged180={onNavigateToWorkbook} />
      <DemandMixCard />
      <AbpPlaceholderCard />
      <IndentAccuracyCard tolerancePct={15} />
    </section>
    <RollupTable />
  </>;
}

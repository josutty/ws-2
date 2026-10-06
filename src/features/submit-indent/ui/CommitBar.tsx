import { useState, type ReactNode } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetDealerCycleSummaryQuery } from '@entities/cycle';
import { getErrorMessage, type ApiError, type SubmitRequest } from '@shared/api';
import { Button, Toast } from '@shared/ui';
import { useReopenDealerIndentMutation } from '../api/submitApi';

export interface CommitBarProps {
  submitted: boolean;
  lineCount: number;
  julyUnits: number;
  totalUnits: number;
  missingCount: number;
  filtered: boolean;
  onReviewSubmit: () => void;
  onViewSent: () => void;
}

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && 'status' in error && 'message' in error;

const createSubmitRequest = (): SubmitRequest => ({ taskId: crypto.randomUUID(), expectedVersion: 0 });

const getJulyUnits = (months: Array<{ periodId?: string; label: string; value: number }> | undefined, fallback: number) =>
  months?.find((month) => month.periodId === '2026-07' || month.label.toLowerCase().includes('july'))?.value ?? fallback;

const getVerticalLabel = (cycleId: string | undefined) => {
  const vertical = cycleId?.split('-').at(-1);
  return vertical && vertical.length > 0 ? vertical.toUpperCase() : 'Indent';
};

export function CommitBar({
  submitted,
  lineCount,
  julyUnits,
  totalUnits,
  missingCount,
  filtered,
  onReviewSubmit,
  onViewSent,
}: CommitBarProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reopenBlocked, setReopenBlocked] = useState(false);
  const {
    data: cycleSummary,
    isFetching: isSummaryFetching,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetDealerCycleSummaryQuery(submitted ? {} : skipToken);
  const [reopenIndent, { isLoading }] = useReopenDealerIndentMutation();

  const submittedLineCount = cycleSummary?.lines ?? lineCount;
  const submittedJulyUnits = getJulyUnits(cycleSummary?.totals.months, julyUnits);
  const verticalLabel = getVerticalLabel(cycleSummary?.cycleId);

  const handleReopen = async () => {
    try {
      await reopenIndent(createSubmitRequest()).unwrap();
      setToastMessage('Indent reopened');
    } catch (caughtError) {
      const message = isApiError(caughtError) ? getErrorMessage(caughtError) : 'Could not reopen indent.';
      if (isApiError(caughtError) && caughtError.status === 409) setReopenBlocked(true);
      setToastMessage(message);
    }
  };

  if (submitted) {
    return (
      <section aria-busy={isSummaryFetching} aria-label="Submission status" className="rounded-card border border-border bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="text-heading-2 text-success">✓</span>
            <p className="text-body font-semibold text-fg">
              {verticalLabel} submitted · {submittedLineCount} lines · {submittedJulyUnits} units for July
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={onViewSent}>View what was sent</Button>
            <Button variant="primary" disabled={isLoading || reopenBlocked} onClick={() => void handleReopen()}>
              {isLoading ? 'Reopening' : 'Reopen'}
            </Button>
          </div>
        </div>
        {isSummaryError ? <Alert message={getErrorMessage(summaryError)} onRetry={() => void refetchSummary()} /> : null}
        <div className="mt-3"><Toast message={toastMessage} /></div>
      </section>
    );
  }

  return (
    <section aria-label="Commit indent" className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2 text-body-sm text-fg">
          <Stat>{lineCount} lines</Stat>
          <Stat>{julyUnits} units for July</Stat>
          <Stat>{totalUnits} units Jul–Sep</Stat>
          {missingCount > 0 ? <Stat tone="warning">{missingCount} with no entry</Stat> : null}
        </div>
        <Button variant="primary" onClick={onReviewSubmit}>Review &amp; submit</Button>
      </div>
      {filtered ? (
        <p className="mt-3 rounded-card border border-warning/30 bg-warning-soft p-3 text-body-sm text-warning">
          Filtered-view total · submission still includes all {lineCount} lines
        </p>
      ) : null}
    </section>
  );
}

function Alert({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="mt-3 rounded-card border border-danger/30 bg-danger-soft p-3 text-body-sm text-danger">
      <p>{message}</p>
      <Button variant="ghost" size="sm" onClick={onRetry}>Retry</Button>
    </div>
  );
}

function Stat({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'warning' }) {
  const className =
    tone === 'warning'
      ? 'rounded-control border border-warning/30 bg-warning-soft px-3 py-1 text-warning'
      : 'rounded-control border border-border bg-surface-muted px-3 py-1 text-fg';
  return <span className={className}>{children}</span>;
}

import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect, useState } from 'react';
import { useGetDealerCycleSummaryQuery } from '@entities/cycle';
import { getErrorMessage, type ApiError, type SubmitPreview, type SubmitRequest } from '@shared/api';
import { Button, Modal, Toast } from '@shared/ui';
import { useGetDealerSubmitPreviewQuery, useSubmitDealerIndentMutation } from '../api/submitApi';

export interface ReviewSubmitModalProps {
  open: boolean;
  onClose: () => void;
  filtered?: boolean;
  filteredLineCount?: number;
  addedLineCount?: number;
  onReviewMissing?: () => void;
}

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && 'status' in error && 'message' in error;

const createSubmitRequest = (): SubmitRequest => ({ taskId: crypto.randomUUID(), expectedVersion: 0 });

const formatReopenUntil = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
};

export function ReviewSubmitModal({
  open,
  onClose,
  filtered = false,
  filteredLineCount,
  addedLineCount,
  onReviewMissing,
}: ReviewSubmitModalProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submitConflict, setSubmitConflict] = useState(false);
  const { data: cycleSummary } = useGetDealerCycleSummaryQuery(open ? {} : skipToken);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetDealerSubmitPreviewQuery(open ? {} : skipToken);
  const [submitIndent, { isLoading: isSubmitting, isError: isSubmitError, error: submitError }] = useSubmitDealerIndentMutation();
  const preview = data;

  useEffect(() => {
    if (open) setSubmitConflict(false);
  }, [open]);

  const handleSubmit = async () => {
    try {
      await submitIndent(createSubmitRequest()).unwrap();
      onClose();
      setToastMessage('Indent submitted');
    } catch (caughtError) {
      if (isApiError(caughtError) && caughtError.status === 409) setSubmitConflict(true);
    }
  };

  const handleReviewMissing = () => {
    onReviewMissing?.();
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        title="Review and submit indent"
        subtitle={cycleSummary ? `${cycleSummary.cycleLabel} · ${cycleSummary.dealer.name}` : undefined}
        onClose={onClose}
        footer={
          <div className="flex items-center justify-end gap-2 border-t border-border-soft pt-3">
            <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>Cancel</Button>
            {!submitConflict ? (
              <Button variant="primary" disabled={isSubmitting || isLoading || isError || !preview} onClick={() => void handleSubmit()}>
                {isSubmitting ? 'Submitting indent' : 'Submit indent'}
              </Button>
            ) : null}
          </div>
        }
      >
        <div className="space-y-4" aria-busy={isFetching || isSubmitting}>
          {isError ? <Alert message={getErrorMessage(error)} onRetry={() => void refetch()} /> : null}
          {isSubmitError ? <SubmitAlert message={getErrorMessage(submitError)} /> : null}
          {isLoading ? <p className="rounded-card border border-border bg-surface-muted p-4 text-body-sm text-fg-muted">Loading submission preview…</p> : null}
          {preview ? (
            <PreviewContent
              preview={preview}
              filtered={filtered}
              filteredLineCount={filteredLineCount}
              addedLineCount={addedLineCount}
              onReviewMissing={handleReviewMissing}
            />
          ) : null}
        </div>
      </Modal>
      <Toast message={toastMessage} />
    </>
  );
}

function PreviewContent({
  preview,
  filtered,
  filteredLineCount,
  addedLineCount,
  onReviewMissing,
}: {
  preview: SubmitPreview;
  filtered: boolean;
  filteredLineCount?: number;
  addedLineCount?: number;
  onReviewMissing: () => void;
}) {
  const missingWarning = preview.warnings.find((warning) => warning.code === 'LINES_WITHOUT_ENTRY');
  return (
    <>
      {filtered && filteredLineCount ? (
        <p className="rounded-card border border-warning/30 bg-warning-soft p-3 text-body-sm text-warning">
          Submitting sends your full indent, not just the {filteredLineCount} on screen.
        </p>
      ) : null}
      {missingWarning ? (
        <div className="rounded-card border border-warning/30 bg-warning-soft p-3 text-body-sm text-warning">
          <p>{missingWarning.message}</p>
          <Button variant="quiet" size="sm" onClick={onReviewMissing}>Review them first</Button>
        </div>
      ) : null}
      {addedLineCount ? (
        <p className="rounded-card border border-primary/30 bg-primary-soft p-3 text-body-sm text-primary">
          {addedLineCount} lines added by you this cycle — flagged for your ASM
        </p>
      ) : null}
      <Summary preview={preview} />
      <p className="text-body-sm text-fg-muted">
        After submission this indent goes to {preview.recipient}. You can reopen until{' '}
        <time dateTime={preview.reopenUntil}>{formatReopenUntil(preview.reopenUntil)}</time>.
      </p>
    </>
  );
}

function Summary({ preview }: { preview: SubmitPreview }) {
  return (
    <dl className="grid grid-cols-2 gap-3 rounded-card border border-border bg-surface-muted p-4 text-body-sm sm:grid-cols-4">
      <SummaryItem label="Lines" value={preview.lines} />
      {preview.totals.months.map((month) => <SummaryItem key={month.periodId} label={month.label} value={month.value} />)}
    </dl>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-fg-muted">{label}</dt>
      <dd className="text-heading-3 text-fg">{value}</dd>
    </div>
  );
}

function Alert({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-card border border-danger/30 bg-danger-soft p-4 text-body-sm text-danger">
      <p>{message}</p>
      <Button variant="ghost" size="sm" onClick={onRetry}>Retry</Button>
    </div>
  );
}

function SubmitAlert({ message }: { message: string }) {
  return <div role="alert" className="rounded-card border border-danger/30 bg-danger-soft p-4 text-body-sm text-danger">{message}</div>;
}

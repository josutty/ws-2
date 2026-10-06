import { http, HttpResponse } from 'msw';
import type { DealerCycleSummary } from '@shared/api/generated/models';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { dealerCycleSummaryFixture } from '@mocks/fixtures/cycleSummary';
import { apiUrl } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, waitFor } from '@test/test-utils';
import { CommitBar, type CommitBarProps } from './CommitBar';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };
const unmountViews: Array<() => void> = [];

afterEach(() => {
  for (const unmount of unmountViews) unmount();
  unmountViews.length = 0;
});

const cycleSummaryWith = (overrides: Partial<DealerCycleSummary>): DealerCycleSummary => ({
  ...dealerCycleSummaryFixture,
  totals: { ...dealerCycleSummaryFixture.totals, months: [...dealerCycleSummaryFixture.totals.months] },
  ...overrides,
});

const withJulyUnits = (summary: DealerCycleSummary, julyUnits: number): DealerCycleSummary => ({
  ...summary,
  totals: {
    ...summary.totals,
    months: summary.totals.months.map((month) => (month.periodId === '2026-07' ? { ...month, value: julyUnits } : month)),
  },
});

const deferred = (): { promise: Promise<void>; resolve: () => void } => {
  let resolve = () => {};
  const promise = new Promise<void>((settle) => {
    resolve = () => settle();
  });

  return { promise, resolve };
};

const renderCommitBar = (props: Partial<CommitBarProps> = {}) => {
  const defaultProps: CommitBarProps = {
    submitted: false,
    lineCount: 52,
    julyUnits: 184,
    totalUnits: 421,
    missingCount: 0,
    filtered: false,
    onReviewSubmit: vi.fn(),
    onViewSent: vi.fn(),
  };

  const view = renderWithProviders(<CommitBar {...defaultProps} {...props} />, { preloadedState });
  unmountViews.push(view.unmount);
  return view;
};

describe('CommitBar', () => {
  it('renders the not-submitted stat row and opens review submit', async () => {
    const onReviewSubmit = vi.fn();
    const { user } = renderCommitBar({ onReviewSubmit });

    expect(screen.getByText('52 lines')).toBeInTheDocument();
    expect(screen.getByText('184 units for July')).toBeInTheDocument();
    expect(screen.getByText('421 units Jul–Sep')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Review & submit' }));

    expect(onReviewSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows the amber no-entry stat when some lines are missing entries', () => {
    renderCommitBar({ missingCount: 6 });

    expect(screen.getByText('6 with no entry')).toBeInTheDocument();
  });

  it('shows the filtered-view submission note', () => {
    renderCommitBar({ filtered: true, lineCount: 17 });

    expect(screen.getByText('Filtered-view total · submission still includes all 17 lines')).toBeInTheDocument();
  });

  it('renders the submitted summary with view-sent and reopen actions', async () => {
    const onViewSent = vi.fn();
    const { user } = renderCommitBar({ submitted: true, lineCount: 52, julyUnits: 184, onViewSent });

    expect(await screen.findByText('DOM submitted · 52 lines · 3665 units for July')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'View what was sent' }));

    expect(onViewSent).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Reopen' })).toBeEnabled();
  });

  it('renders the exact submitted vertical summary from DealerCycleSummary', async () => {
    const summaryRequests: string[] = [];
    const summary = withJulyUnits(cycleSummaryWith({ cycleId: 'RUN-JUL-2026-FERT', lines: 64 }), 205);
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/summary'), ({ request }) => {
        summaryRequests.push(request.url);
        return HttpResponse.json(summary);
      }),
    );

    renderCommitBar({ submitted: true, lineCount: 1, julyUnits: 2 });

    expect(await screen.findByText('FERT submitted · 64 lines · 205 units for July')).toBeInTheDocument();
    expect(screen.queryByText('DOM submitted · 1 lines · 2 units for July')).not.toBeInTheDocument();
    expect(summaryRequests).toHaveLength(1);
  });

  it('refreshes DealerCycleSummary after Reopen succeeds', async () => {
    const initialSummary = withJulyUnits(cycleSummaryWith({ cycleId: 'RUN-JUL-2026-FERT', lines: 64, status: 'SUBMITTED' }), 205);
    const refreshedSummary = withJulyUnits(cycleSummaryWith({ cycleId: 'RUN-JUL-2026-FERT', lines: 65, status: 'DRAFT' }), 212);
    let summaryRequests = 0;
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/summary'), () => {
        summaryRequests += 1;
        return HttpResponse.json(summaryRequests === 1 ? initialSummary : refreshedSummary);
      }),
      http.post(apiUrl('/dealers/:dealerId/cycles/:cycleId/reopen'), () =>
        HttpResponse.json({ taskId: 'task-reopen', status: 'REOPENED', reopenedAt: '2026-07-01T06:00:00+05:30' }),
      ),
    );
    const { user } = renderCommitBar({ submitted: true, lineCount: 1, julyUnits: 2 });

    expect(await screen.findByText('FERT submitted · 64 lines · 205 units for July')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reopen' }));

    await waitFor(() => expect(summaryRequests).toBeGreaterThanOrEqual(2));
    expect(await screen.findByText('FERT submitted · 65 lines · 212 units for July')).toBeInTheDocument();
  });

  it('disables Reopen and shows loading while reopening is pending', async () => {
    const reopenResponse = deferred();
    server.use(
      http.post(apiUrl('/dealers/:dealerId/cycles/:cycleId/reopen'), async () => {
        await reopenResponse.promise;
        return HttpResponse.json({ taskId: 'task-reopen', status: 'REOPENED', reopenedAt: '2026-07-01T06:00:00+05:30' });
      }),
    );
    const { user } = renderCommitBar({ submitted: true });

    await user.click(screen.getByRole('button', { name: 'Reopen' }));

    expect(screen.getByRole('button', { name: 'Reopening' })).toBeDisabled();
    reopenResponse.resolve();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reopen' })).toBeEnabled());
  });

  it('posts reopenDealerIndent when Reopen is clicked', async () => {
    const reopenRequests: string[] = [];
    server.use(
      http.post(apiUrl('/dealers/:dealerId/cycles/:cycleId/reopen'), async ({ request }) => {
        reopenRequests.push(await request.text());
        return HttpResponse.json({ taskId: 'task-reopen', status: 'REOPENED', reopenedAt: '2026-07-01T06:00:00+05:30' });
      }),
    );
    const { user } = renderCommitBar({ submitted: true });

    await user.click(screen.getByRole('button', { name: 'Reopen' }));

    await waitFor(() => expect(reopenRequests).toHaveLength(1));
  });

  it('shows a toast and keeps Reopen disabled after a reopen conflict', async () => {
    server.use(...scenarios.reopenConflict);
    const { user } = renderCommitBar({ submitted: true });

    await user.click(screen.getByRole('button', { name: 'Reopen' }));

    expect(await screen.findByRole('status')).toHaveTextContent('cannot be reopened');
    expect(screen.getByRole('button', { name: 'Reopen' })).toBeDisabled();
  });
});

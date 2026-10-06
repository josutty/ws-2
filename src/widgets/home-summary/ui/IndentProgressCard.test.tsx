import { delay, http, HttpResponse } from 'msw';
import type { DealerCycleSummary } from '@shared/api/generated/models';
import { describe, expect, it, vi } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { dealerCycleSummaryFixture } from '@mocks/fixtures/cycleSummary';
import { apiUrl } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { IndentProgressCard } from './IndentProgressCard';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const cycleSummaryWith = (overrides: Partial<DealerCycleSummary>): DealerCycleSummary => ({
  ...dealerCycleSummaryFixture,
  totals: { ...dealerCycleSummaryFixture.totals, months: [...dealerCycleSummaryFixture.totals.months] },
  ...overrides,
});

const renderIndentProgressCard = (props: Partial<Parameters<typeof IndentProgressCard>[0]> = {}) => {
  const defaultProps: Parameters<typeof IndentProgressCard>[0] = { onContinue: vi.fn(), onReviewSubmit: vi.fn() };
  return renderWithProviders(<IndentProgressCard {...defaultProps} {...props} />, { preloadedState });
};

describe('IndentProgressCard', () => {
  it('shows a labelled loading skeleton while the cycle summary loads', () => {
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/summary'), async () => {
        await delay('infinite');
        return HttpResponse.json(dealerCycleSummaryFixture);
      }),
    );

    renderIndentProgressCard();

    const loading = screen.getByRole('status', { name: 'Loading indent progress' });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(within(loading).getByText('Loading indent progress')).toBeInTheDocument();
  });

  it('renders entered total, July units, not-submitted status, and progressbar values from the query', async () => {
    renderIndentProgressCard();

    expect(await screen.findByRole('heading', { name: 'Your July indent — FERT' })).toBeInTheDocument();
    expect(screen.getByText('46 of 52 lines entered')).toBeInTheDocument();
    expect(screen.getByText('3665 units for July')).toBeInTheDocument();
    expect(screen.getByText('Not submitted')).toBeInTheDocument();
    expect(screen.getByText(/auto-submit reminder/i)).toBeInTheDocument();
    const meter = screen.getByRole('progressbar', { name: 'Indent entry progress' });
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '52');
    expect(meter).toHaveAttribute('aria-valuenow', '46');
  });

  it('renders the submitted status when the summary is submitted', async () => {
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/summary'), () =>
        HttpResponse.json(cycleSummaryWith({ status: 'SUBMITTED' })),
      ),
    );

    renderIndentProgressCard();

    expect(await screen.findByText('Submitted')).toBeInTheDocument();
  });

  it('shows an error banner with a working retry when the cycle summary fails', async () => {
    server.use(...scenarios.cycleSummaryServerError);
    const { user } = renderIndentProgressCard();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load your indent summary.')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: 'Your July indent — FERT' })).toBeInTheDocument();
  });

  it('calls Continue and Review submit callbacks', async () => {
    const onContinue = vi.fn();
    const onReviewSubmit = vi.fn();
    const { user } = renderIndentProgressCard({ onContinue, onReviewSubmit });

    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Review & submit' }));

    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onReviewSubmit).toHaveBeenCalledTimes(1);
  });
});

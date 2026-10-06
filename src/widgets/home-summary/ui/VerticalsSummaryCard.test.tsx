import { delay, http, HttpResponse } from 'msw';
import type { DealerCycleSummary } from '@shared/api/generated/models';
import { describe, expect, it, vi } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { dealerCycleSummaryFixture } from '@mocks/fixtures/cycleSummary';
import { apiUrl } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { VerticalsSummaryCard } from './VerticalsSummaryCard';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const cycleSummaryWith = (overrides: Partial<DealerCycleSummary>): DealerCycleSummary => ({
  ...dealerCycleSummaryFixture,
  totals: { ...dealerCycleSummaryFixture.totals, months: [...dealerCycleSummaryFixture.totals.months] },
  ...overrides,
});

const renderVerticalsSummaryCard = (props: Partial<Parameters<typeof VerticalsSummaryCard>[0]> = {}) => {
  const defaultProps: Parameters<typeof VerticalsSummaryCard>[0] = { onOpen: vi.fn() };
  return renderWithProviders(<VerticalsSummaryCard {...defaultProps} {...props} />, { preloadedState });
};

describe('VerticalsSummaryCard', () => {
  it('shows a labelled loading skeleton while the cycle summary loads', () => {
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/summary'), async () => {
        await delay('infinite');
        return HttpResponse.json(dealerCycleSummaryFixture);
      }),
    );

    renderVerticalsSummaryCard();

    const loading = screen.getByRole('status', { name: 'Loading vertical summaries' });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(within(loading).getByText('Loading vertical summaries')).toBeInTheDocument();
  });

  it('renders the in-progress row for the current vertical with the entered fraction', async () => {
    renderVerticalsSummaryCard();

    const row = await screen.findByRole('row', { name: /FERT In progress 46 \/ 52 Open/i });
    expect(within(row).getByText('FERT')).toBeInTheDocument();
    expect(within(row).getByText('In progress')).toBeInTheDocument();
    expect(within(row).getByText('46 / 52')).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Open FERT' })).toBeInTheDocument();
  });

  it('renders a not-started status when no lines are entered', async () => {
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/summary'), () =>
        HttpResponse.json(cycleSummaryWith({ totals: { ...dealerCycleSummaryFixture.totals, blankLines: 52 } })),
      ),
    );

    renderVerticalsSummaryCard();

    expect(await screen.findByText('Not started')).toBeInTheDocument();
    expect(screen.getByText('0 / 52')).toBeInTheDocument();
  });

  it('renders a submitted status when the summary is submitted', async () => {
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/summary'), () =>
        HttpResponse.json(cycleSummaryWith({ status: 'SUBMITTED' })),
      ),
    );

    renderVerticalsSummaryCard();

    expect(await screen.findByText('Submitted')).toBeInTheDocument();
  });

  it('shows an error banner with a working retry when the cycle summary fails', async () => {
    server.use(...scenarios.cycleSummaryServerError);
    const { user } = renderVerticalsSummaryCard();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load your indent summary.')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('row', { name: /FERT In progress 46 \/ 52 Open/i })).toBeInTheDocument();
  });

  it('calls onOpen with the vertical name', async () => {
    const onOpen = vi.fn();
    const { user } = renderVerticalsSummaryCard({ onOpen });

    await user.click(await screen.findByRole('button', { name: 'Open FERT' }));

    expect(onOpen).toHaveBeenCalledWith('FERT');
  });
});

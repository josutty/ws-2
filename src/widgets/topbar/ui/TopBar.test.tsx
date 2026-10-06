import { http, HttpResponse } from 'msw';
import type { DealerCycleSummary } from '@shared/api/generated/models';
import { describe, expect, it, vi } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { dealerCycleSummaryFixture } from '@mocks/fixtures/cycleSummary';
import { currentUserFixture } from '@mocks/fixtures/currentUser';
import { apiUrl } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, waitFor, within } from '@test/test-utils';
import { TopBar } from './TopBar';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const cycleSummaryWith = (overrides: Partial<DealerCycleSummary>): DealerCycleSummary => ({
  ...dealerCycleSummaryFixture,
  totals: { ...dealerCycleSummaryFixture.totals, months: [...dealerCycleSummaryFixture.totals.months] },
  ...overrides,
});

const renderTopBar = (props: Partial<Parameters<typeof TopBar>[0]> = {}) => {
  const defaultProps: Parameters<typeof TopBar>[0] = { activeView: 'home', onNavigate: vi.fn() };
  return renderWithProviders(<TopBar {...defaultProps} {...props} />, { preloadedState });
};

describe('TopBar', () => {
  it('renders the default user, cycle, cutoff, and not-submitted status from queries', async () => {
    renderTopBar();

    const bar = await screen.findByRole('banner');
    expect(within(bar).getByText('VECV')).toBeInTheDocument();
    expect(within(bar).getByText('plan')).toBeInTheDocument();
    expect(within(bar).getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(within(bar).getByRole('button', { name: 'Indent workbook' })).toBeInTheDocument();
    expect(within(bar).getByText(dealerCycleSummaryFixture.cycleLabel)).toBeInTheDocument();
    expect(within(bar).getByText(/closes/i)).toBeInTheDocument();
    expect(within(bar).getByText('Status: Not submitted')).toBeInTheDocument();
    expect(within(bar).getByText(currentUserFixture.dealerName)).toBeInTheDocument();
    expect(within(bar).getByText(`${currentUserFixture.dealerCode} · Dealer`)).toBeInTheDocument();
  });

  it('calls onNavigate for both navigation targets', async () => {
    const onNavigate = vi.fn();
    const { user } = renderTopBar({ activeView: 'workbook', onNavigate });
    const bar = await screen.findByRole('banner');

    await user.click(within(bar).getByRole('button', { name: 'Home' }));
    await user.click(within(bar).getByRole('button', { name: 'Indent workbook' }));

    expect(onNavigate).toHaveBeenNthCalledWith(1, 'home');
    expect(onNavigate).toHaveBeenNthCalledWith(2, 'workbook');
  });

  it('exposes accessible theme and sign-out controls, and sign-out clears the session', async () => {
    const { store, user } = renderTopBar();
    const bar = await screen.findByRole('banner');

    expect(within(bar).getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
    await user.click(within(bar).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(store.getState().session.authStatus).toBe('anonymous'));
    expect(store.getState().session.token).toBeNull();
    expect(store.getState().session.dealerId).toBeNull();
  });

  it('renders the submitted status with the success treatment', async () => {
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/summary'), () =>
        HttpResponse.json(cycleSummaryWith({ status: 'SUBMITTED' })),
      ),
    );

    renderTopBar();

    const status = await screen.findByText('Status: Submitted');
    expect(status.className).toContain('success');
  });

  it('keeps last-known topbar values visible and offers retry when the cycle summary fails', async () => {
    server.use(...scenarios.cycleSummaryServerError);
    const { user } = renderTopBar();
    const bar = await screen.findByRole('banner');

    expect(within(bar).getByText(dealerCycleSummaryFixture.cycleLabel)).toBeInTheDocument();
    expect(within(bar).getByText('Status: Not submitted')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    server.resetHandlers();
    await user.click(within(bar).getByRole('button', { name: 'Retry cycle summary' }));

    expect(await within(bar).findByText(dealerCycleSummaryFixture.cycleLabel)).toBeInTheDocument();
  });
});

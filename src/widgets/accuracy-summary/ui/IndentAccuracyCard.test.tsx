import { http, HttpResponse } from 'msw';
import type { AccuracyHistoryResponse, AccuracyMonth, AccuracyRow } from '@shared/api/generated/models';
import { describe, expect, it } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { apiUrl } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { IndentAccuracyCard } from './IndentAccuracyCard';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const history: AccuracyMonth[] = [
  { month: '2026-03', indented: 100, offtake: 90 },
  { month: '2026-04', indented: 100, offtake: 90 },
  { month: '2026-05', indented: 100, offtake: 90 },
  { month: '2026-06', indented: 100, offtake: 90 },
];

const accuracyRows: AccuracyRow[] = [{ name: 'Sharma Motors — Ring Road', history }];

const respondWithAccuracy = (response: AccuracyHistoryResponse) => {
  server.use(http.get(apiUrl('/dealers/:dealerId/accuracy-history'), () => HttpResponse.json(response)));
};

const renderIndentAccuracyCard = () => renderWithProviders(<IndentAccuracyCard tolerancePct={10} />, { preloadedState });

describe('IndentAccuracyCard', () => {
  it('renders a labelled loading skeleton and settles after accuracy history loads', async () => {
    let releasePending: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      releasePending = resolve;
    });
    server.use(
      http.get(apiUrl('/dealers/:dealerId/accuracy-history'), async () => {
        await pending;
        return HttpResponse.json({ groupBy: 'outlet', rows: accuracyRows });
      }),
    );

    const view = renderIndentAccuracyCard();

    const loading = screen.getByRole('status', { name: 'Loading indent accuracy' });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(within(loading).getByText('Loading indent accuracy')).toBeInTheDocument();
    releasePending?.();
    expect(await screen.findByRole('heading', { name: 'Your indent accuracy' })).toBeInTheDocument();
    view.unmount();
  });

  it('renders average accuracy, bias label, summary pill, and accessible sparkline text from the query', async () => {
    respondWithAccuracy({ groupBy: 'outlet', rows: accuracyRows });

    renderIndentAccuracyCard();

    expect(await screen.findByRole('heading', { name: 'Your indent accuracy' })).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText(/over-indent/i)).toBeInTheDocument();
    expect(screen.getByText('Within ±10%')).toBeInTheDocument();
    const sparkline = screen.getByRole('img', { name: 'Indent accuracy trend' });
    expect(within(sparkline).getByText('2026-03: 90% accuracy, 100 indented, 90 offtake')).toBeInTheDocument();
    expect(within(sparkline).getByText('2026-06: 90% accuracy, 100 indented, 90 offtake')).toBeInTheDocument();
  });

  it('expands and collapses the report card panel from the toggle', async () => {
    respondWithAccuracy({ groupBy: 'outlet', rows: accuracyRows });
    const { user } = renderIndentAccuracyCard();

    expect(await screen.findByRole('button', { name: 'View report card' })).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'Accuracy report card' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'View report card' }));
    expect(await screen.findByRole('table', { name: 'Accuracy report card' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hide report card' }));
    expect(screen.queryByRole('table', { name: 'Accuracy report card' })).not.toBeInTheDocument();
  });

  it('shows an error banner with a working retry when accuracy history fails', async () => {
    server.use(...scenarios.accuracyHistoryServerError);
    const { user } = renderIndentAccuracyCard();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load accuracy history.')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: 'Your indent accuracy' })).toBeInTheDocument();
  });
});

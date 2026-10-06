import { http, HttpResponse } from 'msw';
import type { IndentLine } from '@shared/api/generated/models';
import { describe, expect, it, vi } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { indentLineFixtures } from '@mocks/fixtures/indentLine';
import { apiUrl, at } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { StockAgingCard } from './StockAgingCard';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const lineWith = (index: number, overrides: Partial<IndentLine>): IndentLine => ({ ...structuredClone(at(indentLineFixtures, index)), ...overrides });

const agingLine = (index: number, under60Days: number, days60To90: number, days90To180: number, over180Days: number) => {
  const total = under60Days + days60To90 + days90To180 + over180Days;
  return lineWith(index, { stock: total, stockBreakdown: { under60Days, days60To90, days90To180, over180Days, total } });
};

const respondWithIndentLines = (items: IndentLine[]) => {
  server.use(
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () =>
      HttpResponse.json({ page: 0, size: 50, totalElements: items.length, items }),
    ),
  );
};

const renderStockAgingCard = (props: Partial<Parameters<typeof StockAgingCard>[0]> = {}) => {
  const defaultProps: Parameters<typeof StockAgingCard>[0] = { onShowAged180: vi.fn() };
  return renderWithProviders(<StockAgingCard {...defaultProps} {...props} />, { preloadedState });
};

describe('StockAgingCard', () => {
  it('renders a labelled loading skeleton while indent lines load', () => {
    server.use(...scenarios.indentLinesSlow);

    renderStockAgingCard();

    const loading = screen.getByRole('status', { name: 'Loading stock aging' });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(within(loading).getByText('Loading stock aging')).toBeInTheDocument();
  });

  it('renders the 4-segment aging bar with counts and proportions derived from indent lines', async () => {
    respondWithIndentLines([agingLine(0, 10, 5, 3, 2), agingLine(1, 5, 5, 2, 3)]);

    renderStockAgingCard();

    expect(await screen.findByRole('heading', { name: 'Stock aging' })).toBeInTheDocument();
    expect(screen.getByText('35 units on hand')).toBeInTheDocument();
    expect(screen.getByText('20 units over 60 days')).toBeInTheDocument();

    const breakdown = screen.getByRole('list', { name: 'Stock aging breakdown' });
    expect(within(breakdown).getByRole('listitem', { name: /<60D 15 units 43%/i })).toBeInTheDocument();
    expect(within(breakdown).getByRole('listitem', { name: /60–90D 10 units 29%/i })).toBeInTheDocument();
    expect(within(breakdown).getByRole('listitem', { name: /90–180D 5 units 14%/i })).toBeInTheDocument();
    expect(within(breakdown).getByRole('listitem', { name: />180D 5 units 14%/i })).toBeInTheDocument();
  });

  it('exposes each segment band and count as reachable text rather than title-only content', async () => {
    respondWithIndentLines([agingLine(0, 10, 5, 3, 2), agingLine(1, 5, 5, 2, 3)]);

    renderStockAgingCard();

    const breakdown = await screen.findByRole('list', { name: 'Stock aging breakdown' });
    expect(within(breakdown).getByText('<60D')).toBeInTheDocument();
    expect(within(breakdown).getByText('15 units')).toBeInTheDocument();
    expect(within(breakdown).getByText('60–90D')).toBeInTheDocument();
    expect(within(breakdown).getByText('10 units')).toBeInTheDocument();
    expect(within(breakdown).getByText('90–180D')).toBeInTheDocument();
    expect(within(breakdown).getByText('5 units')).toBeInTheDocument();
    expect(within(breakdown).getByText('>180D')).toBeInTheDocument();
  });

  it('calls onShowAged180 when Show over 180 days is clicked', async () => {
    const onShowAged180 = vi.fn();
    respondWithIndentLines([agingLine(0, 10, 5, 3, 2)]);
    const { user } = renderStockAgingCard({ onShowAged180 });

    await user.click(await screen.findByRole('button', { name: 'Show over 180 days' }));

    expect(onShowAged180).toHaveBeenCalledTimes(1);
  });

  it('shows an error banner with a working retry when indent lines fail', async () => {
    server.use(...scenarios.indentLinesServerError);
    const { user } = renderStockAgingCard();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load your indent lines.')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: 'Stock aging' })).toBeInTheDocument();
  });

  it('renders the standard empty treatment when no indent lines are in scope', async () => {
    server.use(...scenarios.indentLinesEmpty);

    renderStockAgingCard();

    expect(await screen.findByText('No indent lines in scope.')).toBeInTheDocument();
  });
});

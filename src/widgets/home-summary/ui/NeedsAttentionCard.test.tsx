import { delay, http, HttpResponse } from 'msw';
import type { IndentLine } from '@shared/api/generated/models';
import { describe, expect, it, vi } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { dealerCycleSummaryFixture } from '@mocks/fixtures/cycleSummary';
import { indentLineFixtures } from '@mocks/fixtures/indentLine';
import { apiUrl, at } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { NeedsAttentionCard } from './NeedsAttentionCard';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const renderNeedsAttentionCard = (props: Partial<Parameters<typeof NeedsAttentionCard>[0]> = {}) => {
  const defaultProps: Parameters<typeof NeedsAttentionCard>[0] = { onShow: vi.fn() };
  return renderWithProviders(<NeedsAttentionCard {...defaultProps} {...props} />, { preloadedState });
};

const lineWith = (index: number, overrides: Partial<IndentLine>): IndentLine => ({ ...structuredClone(at(indentLineFixtures, index)), ...overrides });

const noEntryLine = lineWith(0, { periods: at(indentLineFixtures, 0).periods.map((period) => ({ ...period, value: 0 })) });
const agedStockLine = lineWith(1, {
  stockBreakdown: { under60Days: 0, days60To90: 0, days90To180: 0, over180Days: 3, total: 3 },
  stock: 3,
});
const offLastCycleLine = lineWith(2, {
  lastCycle: 100,
  periods: at(indentLineFixtures, 2).periods.map((period) => ({ ...period, value: period.periodId.startsWith('2026-07') ? 35 : period.value })),
});
const addedLine = lineWith(3, { version: 0 });
const attentionLines = [noEntryLine, agedStockLine, offLastCycleLine, addedLine];

const useIndentLines = (items: IndentLine[]) => {
  server.use(
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () =>
      HttpResponse.json({ page: 0, size: 50, totalElements: items.length, items }),
    ),
  );
};

describe('NeedsAttentionCard', () => {
  it('shows a labelled loading skeleton while indent lines load', () => {
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), async () => {
        await delay('infinite');
        return HttpResponse.json({ page: 0, size: 50, totalElements: 0, items: [] });
      }),
    );

    renderNeedsAttentionCard();

    const loading = screen.getByRole('status', { name: 'Loading attention flags' });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(within(loading).getByText('Loading attention flags')).toBeInTheDocument();
  });

  it('renders the empty attention state when there are no flags', async () => {
    server.use(...scenarios.indentLinesEmpty);

    renderNeedsAttentionCard();

    expect(await screen.findByText('✓ Nothing needs your attention right now.')).toBeInTheDocument();
  });

  it('renders populated flag rows derived from indent lines', async () => {
    useIndentLines(attentionLines);

    renderNeedsAttentionCard();

    const list = await screen.findByRole('list', { name: 'Needs attention' });
    expect(within(list).getByRole('listitem', { name: /1 No entry Show/i })).toBeInTheDocument();
    expect(within(list).getByRole('listitem', { name: /1 Aged stock >180D Show/i })).toBeInTheDocument();
    expect(within(list).getByRole('listitem', { name: /1 ±20% off last cycle Show/i })).toBeInTheDocument();
    expect(within(list).getByRole('listitem', { name: /1 Added this cycle Show/i })).toBeInTheDocument();
  });

  it('shows an error banner with a working retry when indent lines fail', async () => {
    server.use(...scenarios.indentLinesServerError);
    const { user } = renderNeedsAttentionCard();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load your indent lines.')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('list', { name: 'Needs attention' })).toBeInTheDocument();
  });

  it('calls onShow with the flag key when Show is clicked', async () => {
    const onShow = vi.fn();
    useIndentLines(attentionLines);
    const { user } = renderNeedsAttentionCard({ onShow });

    await user.click(await screen.findByRole('button', { name: 'Show no-entry' }));
    await user.click(screen.getByRole('button', { name: 'Show aged-stock' }));
    await user.click(screen.getByRole('button', { name: 'Show off-last-cycle' }));
    await user.click(screen.getByRole('button', { name: 'Show added-this-cycle' }));

    expect(onShow).toHaveBeenNthCalledWith(1, 'no-entry');
    expect(onShow).toHaveBeenNthCalledWith(2, 'aged-stock');
    expect(onShow).toHaveBeenNthCalledWith(3, 'off-last-cycle');
    expect(onShow).toHaveBeenNthCalledWith(4, 'added-this-cycle');
  });

  it('still loads the cycle summary so attention context matches the current cycle', async () => {
    const summaryRequests: string[] = [];
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/summary'), ({ request }) => {
        summaryRequests.push(request.url);
        return HttpResponse.json(dealerCycleSummaryFixture);
      }),
    );

    renderNeedsAttentionCard();

    expect(await screen.findByRole('list', { name: 'Needs attention' })).toBeInTheDocument();
    expect(summaryRequests).toHaveLength(1);
  });
});

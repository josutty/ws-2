import type { IndentLine } from '@shared/api/generated/models';
import { http, HttpResponse } from 'msw';
import { useListDealerIndentLinesQuery } from '@entities/indent-line';
import { describe, expect, it, vi } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { buildIndentLine } from '@mocks/factories/indentLine';
import { apiUrl } from '@mocks/lib';
import { server } from '@mocks/node';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { LineDetailDrawer } from './LineDetailDrawer';

const sessionState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const detailLine = buildIndentLine(
  {
    lineId: 'line-detail-1',
    stock: 16,
    stockBreakdown: { under60Days: 3, days60To90: 2, days90To180: 4, over180Days: 7, total: 16 },
    livePos: 5,
    livePosBreakdown: { monthOpeningStock: 11, livePos: 5 },
    pipeline: { confirmed: 12, fa: 8, fc: 6, hotInquiry: 4 },
    offTakeL3: 21,
    offTakeTrend: { l3: 21, l6: 44, l12: 88, lysm: 19 },
    retailL3: 18,
    retailTrend: { l3: 18, l6: 39, l12: 79, lysm: 15 },
    lastCycle: 34,
    periods: [
      { periodId: '2026-07-W1', label: 'W1', value: 2, wasValue: 1, editable: true },
      { periodId: '2026-07-W2', label: 'W2', value: 3, wasValue: 2, editable: true },
      { periodId: '2026-07-W3', label: 'W3', value: 4, wasValue: 3, editable: true },
      { periodId: '2026-07-W4', label: 'W4', value: 5, wasValue: 4, editable: true },
      { periodId: '2026-08', label: 'August', value: 6, wasValue: 0, editable: true },
      { periodId: '2026-09', label: 'September', value: 7, wasValue: 0, editable: true },
    ],
  },
  {
    memberId: 'P-FERT-DETAIL-1',
    fertCode: 'V880CNG',
    description: 'Detail drawer truck',
    model: 'Pro 2110',
    mpg: 'Pro 2110',
    eicherSegment: 'Runner',
    subVertical: '5-16T',
    tonnage: '14T',
    fuel: 'CNG',
    application: 'Repeater',
    acType: 'AC',
  },
);

const respondWithDetailLine = (line: IndentLine = detailLine) => {
  server.use(
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () =>
      HttpResponse.json({ page: 0, size: 50, totalElements: 1, items: [line] }),
    ),
  );
};

function CachedLineDetailDrawer({ lineId, onClose }: { lineId: string | null; onClose: () => void }) {
  useListDealerIndentLinesQuery({ page: 0, size: 50, includeReference: true });
  return <LineDetailDrawer lineId={lineId} onClose={onClose} />;
}

function GridCachedLineDetailDrawer({ lineId, onClose }: { lineId: string | null; onClose: () => void }) {
  useListDealerIndentLinesQuery({ page: 0, size: 10, includeReference: true, search: 'runner', sort: 'fertCode,asc' });
  return <LineDetailDrawer lineId={lineId} onClose={onClose} />;
}

const renderDrawer = (lineId: string | null, onClose = vi.fn()) => {
  respondWithDetailLine();
  return renderWithProviders(<CachedLineDetailDrawer lineId={lineId} onClose={onClose} />, { preloadedState: sessionState });
};

describe('LineDetailDrawer', () => {
  it('renders nothing while lineId is null', () => {
    renderDrawer(null);
    expect(screen.queryByRole('complementary', { name: 'Line detail' })).not.toBeInTheDocument();
  });

  it('renders the selected line detail sections from the cached indent line', async () => {
    renderDrawer('line-detail-1');
    const drawer = await screen.findByRole('complementary', { name: 'Line detail' });
    expect(within(drawer).getByRole('heading', { name: 'V880CNG' })).toBeInTheDocument();
    expect(within(drawer).getByText('Detail drawer truck')).toBeInTheDocument();
    expect(within(drawer).getByRole('heading', { name: 'Vehicle attributes' })).toBeInTheDocument();
    expect(within(drawer).getByRole('heading', { name: 'Stock and live POs' })).toBeInTheDocument();
    expect(within(drawer).getByRole('heading', { name: 'Offtake and retail trend' })).toBeInTheDocument();
    expect(within(drawer).getByRole('heading', { name: 'Last cycle comparison' })).toBeInTheDocument();
    expect(within(drawer).getByText(/SAP source/i)).toBeInTheDocument();
  });

  it('renders the selected line from the same grid list cache args', async () => {
    respondWithDetailLine();
    renderWithProviders(<GridCachedLineDetailDrawer lineId="line-detail-1" onClose={vi.fn()} />, { preloadedState: sessionState });
    const drawer = await screen.findByRole('complementary', { name: 'Line detail' });
    expect(within(drawer).getByRole('heading', { name: 'V880CNG' })).toBeInTheDocument();
    expect(within(drawer).getByText('Detail drawer truck')).toBeInTheDocument();
  });

  it('close button has an accessible label and calls onClose', async () => {
    const onClose = vi.fn();
    const { user } = renderDrawer('line-detail-1', onClose);
    await user.click(await screen.findByRole('button', { name: 'Close line detail' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape and scrim click both call onClose', async () => {
    const onClose = vi.fn();
    const { user } = renderDrawer('line-detail-1', onClose);
    await screen.findByRole('complementary', { name: 'Line detail' });
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Close line detail overlay' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('renders a differs label when the dealer segment does not match the Eicher segment', async () => {
    renderDrawer('line-detail-1');
    const drawer = await screen.findByRole('complementary', { name: 'Line detail' });
    expect(within(drawer).getByText('differs')).toBeInTheDocument();
  });

  it('renders aged stock over 180 days with the critical value and paired label', async () => {
    renderDrawer('line-detail-1');
    const drawer = await screen.findByRole('complementary', { name: 'Line detail' });
    expect(within(drawer).getByText('180+ days')).toBeInTheDocument();
    expect(within(drawer).getByText('7')).toHaveAccessibleName('180+ days 7 critical aged stock');
  });
});

import { http, HttpResponse } from 'msw';
import type { IndentLine } from '@shared/api/generated/models';
import { describe, expect, it } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { buildIndentLine } from '@mocks/factories/indentLine';
import { apiUrl } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { RollupTable } from './RollupTable';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const periodCells = (values: readonly [number, number, number, number, number, number]): IndentLine['periods'] => [
  { periodId: '2026-07-W1', label: 'W1', value: values[0], wasValue: 0, editable: true },
  { periodId: '2026-07-W2', label: 'W2', value: values[1], wasValue: 0, editable: true },
  { periodId: '2026-07-W3', label: 'W3', value: values[2], wasValue: 0, editable: true },
  { periodId: '2026-07-W4', label: 'W4', value: values[3], wasValue: 0, editable: true },
  { periodId: '2026-08', label: 'August', value: values[4], wasValue: 0, editable: true },
  { periodId: '2026-09', label: 'September', value: values[5], wasValue: 0, editable: true },
];

const lineWith = (
  index: number,
  product: Partial<IndentLine['product']>,
  values: readonly [number, number, number, number, number, number],
): IndentLine =>
  buildIndentLine(
    {
      lineId: `line-rollup-${index}`,
      stock: index,
      stockBreakdown: { under60Days: index, days60To90: index + 1, days90To180: index + 2, over180Days: index + 3, total: index },
      livePos: index + 4,
      livePosBreakdown: { monthOpeningStock: index + 5, livePos: index + 4 },
      pipeline: { confirmed: index + 6, fa: index + 7, fc: index + 8, hotInquiry: index + 9 },
      offTakeL3: index + 10,
      offTakeTrend: { l3: index + 10, l6: index + 11, l12: index + 12, lysm: index + 13 },
      retailL3: index + 14,
      retailTrend: { l3: index + 14, l6: index + 15, l12: index + 16, lysm: index + 17 },
      lastCycle: index + 18,
      periods: periodCells(values),
      version: 1,
    },
    {
      memberId: `P-FERT-ROLLUP-${index}`,
      fertCode: `V90${index}CNG`,
      description: `Rollup vehicle ${index}`,
      model: index === 3 ? 'Pro 6028' : 'Pro 2110',
      mpg: index === 3 ? 'Pro 6028' : 'Pro 2110',
      eicherSegment: index === 2 ? 'Runner' : 'Repeater',
      subVertical: index === 3 ? '<5T' : '5-16T',
      tonnage: index === 3 ? '5T' : '14T',
      fuel: 'CNG',
      application: index === 2 ? 'Runner' : 'Repeater',
      acType: index === 3 ? 'Non-AC' : 'AC',
      ...product,
    },
  );

const rollupLines = [
  lineWith(1, {}, [1, 2, 3, 4, 5, 6]),
  lineWith(2, { fertCode: 'V902CNG', description: 'Runner rollup vehicle' }, [10, 20, 30, 40, 50, 60]),
  lineWith(3, { fertCode: 'V903DSL', fuel: 'Diesel' }, [100, 200, 300, 400, 500, 600]),
];

const respondWithIndentLines = (items: IndentLine[]) => {
  server.use(
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () =>
      HttpResponse.json({ page: 0, size: 50, totalElements: items.length, items }),
    ),
  );
};

const renderRollupTable = () => renderWithProviders(<RollupTable />, { preloadedState });

describe('RollupTable', () => {
  it('renders a labelled loading skeleton while indent lines load', () => {
    server.use(...scenarios.indentLinesSlow);

    renderRollupTable();

    const loading = screen.getByRole('status', { name: 'Loading rollup table' });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(within(loading).getByText('Loading rollup table')).toBeInTheDocument();
  });

  it('shows an error banner with a working retry when indent lines fail', async () => {
    server.use(...scenarios.indentLinesServerError);
    const { user } = renderRollupTable();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load your indent lines.')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('table', { name: 'Indent rollup' })).toBeInTheDocument();
  });

  it('renders the standard empty treatment when there are no indent lines', async () => {
    server.use(...scenarios.indentLinesEmpty);

    renderRollupTable();

    expect(await screen.findByText('No indent lines in scope.')).toBeInTheDocument();
  });

  it('defaults to Sub-vertical grouping and renders a visible active-filter note', async () => {
    respondWithIndentLines(rollupLines);

    renderRollupTable();

    const table = await screen.findByRole('table', { name: 'Indent rollup' });
    expect(screen.getByRole('group', { name: 'Group by' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sub-vertical' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/honours the Workbook's active filters/i)).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /5-16T/i })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /<5T/i })).toBeInTheDocument();
  });

  it('switches the grouping control and re-groups rows by MPG', async () => {
    respondWithIndentLines(rollupLines);
    const { user } = renderRollupTable();

    await user.click(await screen.findByRole('button', { name: 'MPG' }));

    const table = await screen.findByRole('table', { name: 'Indent rollup' });
    expect(screen.getByRole('button', { name: 'MPG' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(table).getByRole('row', { name: /Pro 2110/i })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /Pro 6028/i })).toBeInTheDocument();
    expect(within(table).queryByRole('row', { name: /5-16T/i })).not.toBeInTheDocument();
  });

  it('expands a group to reveal indented child FERT rows and flips the button label', async () => {
    respondWithIndentLines(rollupLines);
    const { user } = renderRollupTable();

    const expand = await screen.findByRole('button', { name: 'Expand 5-16T' });
    await user.click(expand);

    expect(screen.getByRole('button', { name: 'Collapse 5-16T' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /V901CNG.*Rollup vehicle 1/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /V902CNG.*Runner rollup vehicle/i })).toBeInTheDocument();
  });

  it('cycles a collapsible band from summary to full and then off', async () => {
    respondWithIndentLines(rollupLines);
    const { user } = renderRollupTable();

    const table = await screen.findByRole('table', { name: 'Indent rollup' });
    expect(within(table).getByRole('columnheader', { name: 'Current dealer stock' })).toBeInTheDocument();
    expect(within(table).queryByRole('columnheader', { name: '0-60 days' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Current dealer stock: summary' }));
    expect(within(table).getByRole('columnheader', { name: '0-60 days' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: '60-90 days' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: '90-180 days' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: '180+ days' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Current dealer stock: full' }));
    expect(within(table).queryByRole('columnheader', { name: 'Current dealer stock' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Current dealer stock: off' })).toBeInTheDocument();
  });

  it('sums the visible group rows and Total row from fixture values', async () => {
    respondWithIndentLines(rollupLines);

    renderRollupTable();

    const table = await screen.findByRole('table', { name: 'Indent rollup' });
    expect(within(table).getByRole('row', { name: /5-16T.*11.*22.*33.*44.*55.*66/i })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /<5T.*100.*200.*300.*400.*500.*600/i })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /Total.*111.*222.*333.*444.*555.*666/i })).toBeInTheDocument();
  });
});

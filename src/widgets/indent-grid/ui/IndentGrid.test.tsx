import { delay, http, HttpResponse } from 'msw';
import type { IndentLine } from '@shared/api/generated/models';
import { describe, expect, it, vi } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { buildAddedIndentLine, buildIndentLine } from '@mocks/factories/indentLine';
import { apiUrl, at } from '@mocks/lib';
import { indentLineFixtures } from '@mocks/fixtures/indentLine';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, waitFor, within } from '@test/test-utils';
import { IndentGrid } from './IndentGrid';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const periodCells = (values: readonly [number, number, number, number, number, number], wasValue = 0): IndentLine['periods'] => [
  { periodId: '2026-07-W1', label: 'W1', value: values[0], wasValue, editable: true },
  { periodId: '2026-07-W2', label: 'W2', value: values[1], wasValue: 0, editable: true },
  { periodId: '2026-07-W3', label: 'W3', value: values[2], wasValue: 0, editable: true },
  { periodId: '2026-07-W4', label: 'W4', value: values[3], wasValue: 0, editable: true },
  { periodId: '2026-08', label: 'August', value: values[4], wasValue: 0, editable: true },
  { periodId: '2026-09', label: 'September', value: values[5], wasValue: 0, editable: true },
];

const lineWith = (index: number, values: readonly [number, number, number, number, number, number]): IndentLine =>
  buildIndentLine(
    {
      lineId: `line-grid-${index}`,
      stock: 12 + index,
      stockBreakdown: { under60Days: 3, days60To90: 2, days90To180: 1, over180Days: index, total: 6 + index },
      livePos: 2 + index,
      livePosBreakdown: { monthOpeningStock: 5 + index, livePos: 2 + index },
      pipeline: { confirmed: 10 + index, fa: 5 + index, fc: 2 + index, hotInquiry: 1 + index },
      offTakeL3: 20 + index,
      offTakeTrend: { l3: 20 + index, l6: 40 + index, l12: 80 + index, lysm: 18 + index },
      retailL3: 15 + index,
      retailTrend: { l3: 15 + index, l6: 35 + index, l12: 75 + index, lysm: 12 + index },
      lastCycle: 90 + index,
      periods: periodCells(values, index === 1 ? 7 : 0),
      version: 1,
    },
    {
      memberId: `P-FERT-GRID-${index}`,
      fertCode: `V77${index}CNG`,
      description: `Grid truck ${index}`,
      model: index === 2 ? 'Pro 6028' : 'Pro 2110',
      mpg: index === 2 ? 'Pro 6028' : 'Pro 2110',
      eicherSegment: index === 2 ? 'Runner' : 'Repeater',
      subVertical: '5-16T',
      tonnage: '14T',
      fuel: 'CNG',
      application: index === 2 ? 'Runner' : 'Repeater',
      acType: 'AC',
    },
  );

const addedLine = buildAddedIndentLine({
  memberId: 'P-FERT-GRID-ADDED',
  fertCode: 'V779CNG',
  description: 'Dealer-added grid truck',
  model: 'Pro 3015',
  mpg: 'Pro 3015',
  eicherSegment: 'Stranger',
  subVertical: '16-25T',
  tonnage: '19T',
  fuel: 'CNG',
  application: 'Stranger',
  acType: 'Non-AC',
});

const gridLines = [lineWith(1, [11, 12, 13, 14, 21, 31]), lineWith(2, [1, 2, 3, 4, 5, 6]), lineWith(3, [0, 0, 0, 0, 0, 0]), addedLine];

const respondWithIndentLines = (items: IndentLine[]) => {
  server.use(
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () =>
      HttpResponse.json({ page: 0, size: 50, totalElements: items.length, items }),
    ),
  );
};

const defaultProps = {
  vertical: 'lmd' as const,
  query: '',
  sort: null,
  onSort: vi.fn(),
  submitted: false,
  density: 'comfortable' as const,
  bandMode: { vehicle: 'full', stock: 'summary', livePos: 'summary', pipeline: 'summary', offTake: 'summary', retail: 'summary', lastCycle: 'summary' },
  onOpenDetail: vi.fn(),
};

const renderIndentGrid = (props: Partial<typeof defaultProps> = {}) =>
  renderWithProviders(<IndentGrid {...defaultProps} {...props} />, { preloadedState });

describe('IndentGrid', () => {
  it('shows a labelled loading skeleton while indent lines load', () => {
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), async () => {
        await delay(100);
        return HttpResponse.json({ page: 0, size: 50, totalElements: 0, items: [] });
      }),
    );
    renderIndentGrid();
    const loading = screen.getByRole('status', { name: 'Loading indent grid' });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(within(loading).getByText('Loading indent grid')).toBeInTheDocument();
  });

  it('renders rows from listDealerIndentLines with carry-forward hints and a filtered total row', async () => {
    respondWithIndentLines(gridLines);
    renderIndentGrid();
    const table = await screen.findByRole('table', { name: 'Dealer indent grid' });
    expect(within(table).getByRole('row', { name: /V771CNG.*Grid truck 1/i })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /V772CNG.*Grid truck 2/i })).toBeInTheDocument();
    expect(within(table).getByText('was 7')).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /Filtered total.*12.*14.*16.*18.*26.*37/i })).toBeInTheDocument();
  });

  it('renders the empty panel and a clear-all-filters action when no lines match', async () => {
    server.use(...scenarios.indentLinesEmpty);
    renderIndentGrid({ query: 'no matching FERT' });
    expect(await screen.findByText('No lines match these filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear all filters' })).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'Dealer indent grid' })).not.toBeInTheDocument();
  });

  it('shows an error banner with a working retry when indent lines fail', async () => {
    server.use(...scenarios.indentLinesServerError);
    const { user } = renderIndentGrid();
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load your indent lines.')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('table', { name: 'Dealer indent grid' })).toBeInTheDocument();
  });

  it('disables all editable cells when the submitted prop locks the grid', async () => {
    respondWithIndentLines(gridLines);
    renderIndentGrid({ submitted: true });
    const table = await screen.findByRole('table', { name: 'Dealer indent grid' });
    const cells = within(table).getAllByRole('spinbutton');
    expect(cells).toHaveLength(24);
    cells.forEach((cell) => expect(cell).toBeDisabled());
  });

  it('optimistically edits a cell, then reverts and disables it when the server reports a conflict', async () => {
    respondWithIndentLines(gridLines);
    server.use(...scenarios.updateIndentCellConflict);
    const { user } = renderIndentGrid();
    const cell = await screen.findByRole('spinbutton', { name: /V771CNG W1 indent quantity/i });
    await user.clear(cell);
    await user.type(cell, '19');
    expect(cell).toHaveValue(19);
    expect(await screen.findByRole('status', { name: /cell changed since you loaded it/i })).toBeInTheDocument();
    await waitFor(() => expect(cell).toHaveValue(11));
    expect(cell).toBeDisabled();
  });

  it('pastes a rectangle of values and reports partial batch success when some cells are rejected', async () => {
    respondWithIndentLines(gridLines);
    server.use(...scenarios.batchUpdateCellsPartialReject);
    const { user } = renderIndentGrid();
    const cell = await screen.findByRole('spinbutton', { name: /V771CNG W1 indent quantity/i });
    await user.click(cell);
    await user.paste('20\t21\n30\t31');
    expect(await screen.findByRole('status', { name: '3 of 4 cells pasted, 1 failed' })).toBeInTheDocument();
  });

  it('clicking a sortable column header toggles sort ascending, descending, then cleared', async () => {
    respondWithIndentLines(gridLines);
    const onSort = vi.fn();
    const { user, rerender } = renderIndentGrid({ onSort });
    await user.click(await screen.findByRole('button', { name: /FERT code/i }));
    expect(onSort).toHaveBeenLastCalledWith('fertCode');
    rerender(<IndentGrid {...defaultProps} onSort={onSort} sort={{ key: 'fertCode', dir: 1 }} />);
    expect(screen.getByRole('columnheader', { name: /FERT code.*ascending/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /FERT code/i }));
    expect(onSort).toHaveBeenCalledTimes(2);
    rerender(<IndentGrid {...defaultProps} onSort={onSort} sort={{ key: 'fertCode', dir: -1 }} />);
    expect(screen.getByRole('columnheader', { name: /FERT code.*descending/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /FERT code/i }));
    expect(onSort).toHaveBeenCalledTimes(3);
  });

  it('clicking a band header cycles visible columns according to bandMode', async () => {
    respondWithIndentLines(gridLines);
    const { user } = renderIndentGrid();
    const table = await screen.findByRole('table', { name: 'Dealer indent grid' });
    expect(within(table).getByRole('columnheader', { name: 'Current dealer stock' })).toBeInTheDocument();
    expect(within(table).queryByRole('columnheader', { name: '0-60 days' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Current dealer stock: summary' }));
    expect(within(table).getByRole('columnheader', { name: '0-60 days' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: '180+ days' })).toBeInTheDocument();
  });

  it('clicking the info button calls onOpenDetail with the row line id', async () => {
    respondWithIndentLines(gridLines);
    const onOpenDetail = vi.fn();
    const { user } = renderIndentGrid({ onOpenDetail });
    await user.click(await screen.findByRole('button', { name: 'Open details for V771CNG' }));
    expect(onOpenDetail).toHaveBeenCalledWith('line-grid-1');
  });

  it('no-entry and added rows include visually hidden text equivalents in addition to visual styling', async () => {
    respondWithIndentLines(gridLines);
    renderIndentGrid();
    const table = await screen.findByRole('table', { name: 'Dealer indent grid' });
    expect(within(table).getByRole('row', { name: /V773CNG.*No entry yet/i })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /V779CNG.*ADDED.*Added by you/i })).toBeInTheDocument();
    expect(within(table).getByText('ADDED')).toBeInTheDocument();
  });

  it('renders default fixture data without direct array indexing', async () => {
    renderIndentGrid();
    expect(await screen.findByText(at(indentLineFixtures, 0).product.fertCode)).toBeInTheDocument();
  });
});

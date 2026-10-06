import { http, HttpResponse } from 'msw';
import type { AccuracyHistoryResponse, Outlet } from '@shared/api/generated/models';
import { describe, expect, it, vi } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { accuracyByFertFixtures, accuracyByOutletFixtures } from '@mocks/fixtures/accuracy';
import { outletFixtures } from '@mocks/fixtures/outlet';
import { apiUrl, at } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { AccuracyReportPanel } from './AccuracyReportPanel';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const respondWithAccuracy = (responseFor: (groupBy: string | null) => AccuracyHistoryResponse) => {
  server.use(
    http.get(apiUrl('/dealers/:dealerId/accuracy-history'), ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json(responseFor(url.searchParams.get('groupBy')));
    }),
  );
};

const respondWithOutlets = (items: Outlet[]) => {
  server.use(http.get(apiUrl('/dealers/:dealerId/outlets'), () => HttpResponse.json({ items })));
};

const renderAccuracyReportPanel = (props: Partial<Parameters<typeof AccuracyReportPanel>[0]> = {}) =>
  renderWithProviders(<AccuracyReportPanel {...props} />, { preloadedState });

describe('AccuracyReportPanel', () => {
  it('renders a labelled loading skeleton and settles after outlet report data loads', async () => {
    let releasePending: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      releasePending = resolve;
    });
    server.use(
      http.get(apiUrl('/dealers/:dealerId/accuracy-history'), async () => {
        await pending;
        return HttpResponse.json({ groupBy: 'outlet', rows: accuracyByOutletFixtures });
      }),
    );

    const view = renderAccuracyReportPanel();

    const loading = screen.getByRole('status', { name: 'Loading accuracy report card' });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(within(loading).getByText('Loading accuracy report card')).toBeInTheDocument();
    releasePending?.();
    expect(await screen.findByRole('table', { name: 'Accuracy report card' })).toBeInTheDocument();
    view.unmount();
  });

  it('renders one outlet row per dealer outlet plus the total row in the by-outlet view', async () => {
    respondWithAccuracy(() => ({ groupBy: 'outlet', rows: accuracyByOutletFixtures }));
    respondWithOutlets(outletFixtures);

    renderAccuracyReportPanel();

    const table = await screen.findByRole('table', { name: 'Accuracy report card' });
    expect(within(table).getByRole('columnheader', { name: 'Outlet' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Accuracy' })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: new RegExp(at(outletFixtures, 0).name) })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: new RegExp(at(outletFixtures, 1).name) })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: new RegExp(at(outletFixtures, 2).name) })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /All three outlets/i })).toBeInTheDocument();
  });

  it('switches to by-vehicle data and renders FERT rows', async () => {
    respondWithAccuracy((groupBy) => ({
      groupBy: groupBy === 'fert' ? 'fert' : 'outlet',
      rows: groupBy === 'fert' ? accuracyByFertFixtures : accuracyByOutletFixtures,
    }));

    const { user } = renderAccuracyReportPanel();

    await user.click(await screen.findByRole('button', { name: 'By vehicle' }));
    const firstFert = at(accuracyByFertFixtures, 0);
    expect(await screen.findByRole('row', { name: new RegExp(`${firstFert.code ?? ''}.*${firstFert.name}`) })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Open FERT accuracy details/i })).toHaveLength(accuracyByFertFixtures.length);
  });

  it('calls onSelectFert when a FERT row is clicked', async () => {
    const onSelectFert = vi.fn();
    respondWithAccuracy((groupBy) => ({
      groupBy: groupBy === 'fert' ? 'fert' : 'outlet',
      rows: groupBy === 'fert' ? accuracyByFertFixtures : accuracyByOutletFixtures,
    }));
    const { user } = renderAccuracyReportPanel({ onSelectFert });

    await user.click(await screen.findByRole('button', { name: 'By vehicle' }));
    await user.click(await screen.findByRole('button', { name: new RegExp(`Open FERT accuracy details.*${at(accuracyByFertFixtures, 0).code ?? ''}`) }));

    expect(onSelectFert).toHaveBeenCalledWith(at(accuracyByFertFixtures, 0).code);
  });

  it('calls onSelectFert when Enter is pressed on a FERT row', async () => {
    const onSelectFert = vi.fn();
    respondWithAccuracy((groupBy) => ({
      groupBy: groupBy === 'fert' ? 'fert' : 'outlet',
      rows: groupBy === 'fert' ? accuracyByFertFixtures : accuracyByOutletFixtures,
    }));
    const { user } = renderAccuracyReportPanel({ onSelectFert });

    await user.click(await screen.findByRole('button', { name: 'By vehicle' }));
    const firstFertRow = await screen.findByRole('button', {
      name: new RegExp(`Open FERT accuracy details.*${at(accuracyByFertFixtures, 0).code ?? ''}`),
    });
    firstFertRow.focus();
    await user.keyboard('{Enter}');

    expect(onSelectFert).toHaveBeenCalledWith(at(accuracyByFertFixtures, 0).code);
  });

  it('shows the by-vehicle empty state when no FERTs have offtake history', async () => {
    server.use(...scenarios.accuracyHistoryEmpty);
    const { user } = renderAccuracyReportPanel();

    await user.click(await screen.findByRole('button', { name: 'By vehicle' }));

    expect(await screen.findByText('No lines with offtake history in this filter.')).toBeInTheDocument();
  });

  it('shows an error banner with a working retry when accuracy history fails', async () => {
    server.use(...scenarios.accuracyHistoryServerError);
    const { user } = renderAccuracyReportPanel();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load accuracy history.')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('table', { name: 'Accuracy report card' })).toBeInTheDocument();
  });
});

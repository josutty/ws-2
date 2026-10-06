import { http, HttpResponse } from 'msw';
import type { IndentLine } from '@shared/api/generated/models';
import { describe, expect, it } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { indentLineFixtures } from '@mocks/fixtures/indentLine';
import { apiUrl, at } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { DemandMixCard } from './DemandMixCard';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const lineWith = (index: number, eicherSegment: IndentLine['product']['eicherSegment']): IndentLine => ({
  ...structuredClone(at(indentLineFixtures, index)),
  product: { ...structuredClone(at(indentLineFixtures, index).product), eicherSegment },
});

const respondWithIndentLines = (items: IndentLine[]) => {
  server.use(
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () =>
      HttpResponse.json({ page: 0, size: 50, totalElements: items.length, items }),
    ),
  );
};

const renderDemandMixCard = () => renderWithProviders(<DemandMixCard />, { preloadedState });

describe('DemandMixCard', () => {
  it('renders a labelled loading skeleton and settles after the pending indent-lines handler releases', async () => {
    let releasePending: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      releasePending = resolve;
    });
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), async () => {
        await pending;
        return HttpResponse.json({ page: 0, size: 50, totalElements: 0, items: [] });
      }),
    );

    const view = renderDemandMixCard();

    const loading = screen.getByRole('status', { name: 'Loading demand mix' });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(within(loading).getByText('Loading demand mix')).toBeInTheDocument();
    releasePending?.();
    expect(await screen.findByText('No indent lines in scope.')).toBeInTheDocument();
    view.unmount();
  });

  it('shows an error banner with a working retry when indent lines fail', async () => {
    server.use(...scenarios.indentLinesServerError);
    const { user } = renderDemandMixCard();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load your indent lines.')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: 'Demand mix' })).toBeInTheDocument();
  });

  it('renders the standard empty treatment when no indent lines are in scope', async () => {
    server.use(...scenarios.indentLinesEmpty);

    renderDemandMixCard();

    expect(await screen.findByText('No indent lines in scope.')).toBeInTheDocument();
  });

  it('renders total FERT count, reachable segment counts, and a caption summarizing all segment counts', async () => {
    respondWithIndentLines([
      lineWith(0, 'Runner'),
      lineWith(1, 'Runner'),
      lineWith(2, 'Repeater'),
      lineWith(3, 'Stranger'),
    ]);

    renderDemandMixCard();

    expect(await screen.findByRole('heading', { name: 'Demand mix' })).toBeInTheDocument();
    expect(screen.getByText('4 FERTs')).toBeInTheDocument();

    const breakdown = screen.getByRole('list', { name: 'Demand mix breakdown' });
    expect(within(breakdown).getByRole('listitem', { name: /Runner 2 FERTs 50%/i })).toBeInTheDocument();
    expect(within(breakdown).getByRole('listitem', { name: /Repeater 1 FERTs 25%/i })).toBeInTheDocument();
    expect(within(breakdown).getByRole('listitem', { name: /Stranger 1 FERTs 25%/i })).toBeInTheDocument();
    expect(within(breakdown).getByText('Runner 2 FERTs 50%')).toBeInTheDocument();
    expect(within(breakdown).getByText('Repeater 1 FERTs 25%')).toBeInTheDocument();
    expect(within(breakdown).getByText('Stranger 1 FERTs 25%')).toBeInTheDocument();
    expect(screen.getByText('Runner 2 lines, Repeater 1 line, Stranger 1 line.')).toBeInTheDocument();
  });
});

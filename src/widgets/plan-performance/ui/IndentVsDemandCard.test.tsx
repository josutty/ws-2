import { http, HttpResponse } from 'msw';
import type { IndentLine } from '@shared/api/generated/models';
import { describe, expect, it, vi } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { indentLineFixtures } from '@mocks/fixtures/indentLine';
import { apiUrl, at } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { IndentVsDemandCard } from './IndentVsDemandCard';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const lineWith = (index: number, overrides: Partial<IndentLine>): IndentLine => ({ ...structuredClone(at(indentLineFixtures, index)), ...overrides });

const julyPeriods = (values: readonly [number, number, number, number]) => [
  { periodId: '2026-07-W1', label: 'W1', value: values[0], wasValue: 0, editable: true },
  { periodId: '2026-07-W2', label: 'W2', value: values[1], wasValue: 0, editable: true },
  { periodId: '2026-07-W3', label: 'W3', value: values[2], wasValue: 0, editable: true },
  { periodId: '2026-07-W4', label: 'W4', value: values[3], wasValue: 0, editable: true },
  { periodId: '2026-08', label: 'August', value: 0, wasValue: 0, editable: true },
  { periodId: '2026-09', label: 'September', value: 0, wasValue: 0, editable: true },
];

const respondWithIndentLines = (items: IndentLine[]) => {
  server.use(
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () =>
      HttpResponse.json({ page: 0, size: 50, totalElements: items.length, items }),
    ),
  );
};

const renderIndentVsDemandCard = (props: Partial<Parameters<typeof IndentVsDemandCard>[0]> = {}) =>
  renderWithProviders(<IndentVsDemandCard {...props} />, { preloadedState });

describe('IndentVsDemandCard', () => {
  it('renders a labelled loading skeleton while indent lines load', () => {
    server.use(...scenarios.indentLinesSlow);

    renderIndentVsDemandCard();

    const loading = screen.getByRole('status', { name: 'Loading indent versus demand' });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(within(loading).getByText('Loading indent versus demand')).toBeInTheDocument();
  });

  it('renders indent/offtake totals and an on-track comparison pill inside the ±15% threshold', async () => {
    respondWithIndentLines([lineWith(0, { offTakeL3: 120, lastCycle: 50, periods: julyPeriods([10, 10, 10, 15]) })]);

    renderIndentVsDemandCard();

    expect(await screen.findByRole('heading', { name: 'Indent vs demand' })).toBeInTheDocument();
    expect(screen.getByText('45 units')).toBeInTheDocument();
    expect(screen.getByText('120 units')).toBeInTheDocument();
    expect(screen.getByText('50 units')).toBeInTheDocument();
    expect(screen.getByText('+13% vs monthly run-rate')).toBeInTheDocument();
    expect(screen.getByText('-10% vs last cycle plan')).toBeInTheDocument();
    expect(screen.getByText('On track')).toBeInTheDocument();
  });

  it('renders a warning comparison pill when July indent is more than 15% above monthly run-rate', async () => {
    respondWithIndentLines([lineWith(0, { offTakeL3: 120, lastCycle: 40, periods: julyPeriods([12, 12, 12, 12]) })]);

    renderIndentVsDemandCard();

    expect(await screen.findByText('+20% vs monthly run-rate')).toBeInTheDocument();
    expect(screen.getByText('Watch')).toBeInTheDocument();
  });

  it('renders a critical comparison pill when July indent is more than 15% below monthly run-rate', async () => {
    respondWithIndentLines([lineWith(0, { offTakeL3: 120, lastCycle: 40, periods: julyPeriods([8, 8, 8, 8]) })]);

    renderIndentVsDemandCard();

    expect(await screen.findByText('-20% vs monthly run-rate')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('shows an error banner with a working retry when indent lines fail', async () => {
    server.use(...scenarios.indentLinesServerError);
    const { user } = renderIndentVsDemandCard();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load your indent lines.')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: 'Indent vs demand' })).toBeInTheDocument();
  });

  it('renders the standard empty state when no indent lines are in scope', async () => {
    server.use(...scenarios.indentLinesEmpty);

    renderIndentVsDemandCard();

    expect(await screen.findByText('No indent lines in scope.')).toBeInTheDocument();
  });

  it('calls onShowOffTrack when the off-track action is clicked', async () => {
    const onShowOffTrack = vi.fn();
    respondWithIndentLines([lineWith(0, { offTakeL3: 120, lastCycle: 40, periods: julyPeriods([8, 8, 8, 8]) })]);
    const { user } = renderIndentVsDemandCard({ onShowOffTrack });

    await user.click(await screen.findByRole('button', { name: 'Show off-track lines' }));

    expect(onShowOffTrack).toHaveBeenCalledTimes(1);
  });
});

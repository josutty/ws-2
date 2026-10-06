import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { DEALER_ID } from '@mocks/constants';
import { FilterRail, type FilterKey, type FilterRailProps } from './FilterRail';

const filterLabels = ['Vertical', 'FERT', 'Sub-vertical', 'Demand segment', 'MPG model', 'Tonnage', 'Fuel', 'Cabin', 'FERT History', 'Status'];

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const emptyFilters: Record<FilterKey, Set<string>> = {
  vertical: new Set<string>(),
  fert: new Set<string>(),
  subVertical: new Set<string>(),
  demandSegment: new Set<string>(),
  mpgModel: new Set<string>(),
  tonnage: new Set<string>(),
  fuel: new Set<string>(),
  cabin: new Set<string>(),
  fertHistory: new Set<string>(),
  status: new Set<string>(),
};

const renderRail = (props: Partial<FilterRailProps> = {}) => {
  const defaultProps: FilterRailProps = {
    filters: emptyFilters,
    collapsed: false,
    onToggleCollapsed: vi.fn(),
    onChangeFilter: vi.fn(),
    onClear: vi.fn(),
  };

  return renderWithProviders(<FilterRail {...defaultProps} {...props} />, { preloadedState });
};

describe('FilterRail', () => {
  it('renders the expanded rail with one filter per documented key and no saved-view controls', async () => {
    renderRail();

    const rail = await screen.findByRole('complementary', { name: 'Filters' });
    expect(within(rail).getByRole('button', { name: 'Collapse filters' })).toHaveAttribute('aria-expanded', 'true');
    for (const label of filterLabels) {
      expect(within(rail).getByText(label)).toBeInTheDocument();
    }
    expect(within(rail).getAllByRole('button', { name: 'All' })).toHaveLength(filterLabels.length);
    expect(within(rail).getByRole('button', { name: 'Clear all' })).toBeInTheDocument();
    expect(within(rail).queryByRole('button', { name: /save view/i })).not.toBeInTheDocument();
    expect(within(rail).queryByRole('combobox', { name: /saved views/i })).not.toBeInTheDocument();
  });

  it('renders the collapsed stub with the active-filter count', async () => {
    renderRail({ collapsed: true, filters: { ...emptyFilters, vertical: new Set(['Truck']), fuel: new Set(['Diesel']) } });

    const rail = await screen.findByRole('complementary', { name: 'Filters' });
    expect(within(rail).getByRole('button', { name: 'Expand filters' })).toHaveAttribute('aria-expanded', 'false');
    expect(within(rail).getByText('Filters')).toBeInTheDocument();
    expect(within(rail).getByText('2')).toBeInTheDocument();
    expect(within(rail).queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
  });

  it('shows the active-filter count in expanded mode', async () => {
    renderRail({ filters: { ...emptyFilters, vertical: new Set(['Truck', 'Bus']), fuel: new Set(['Diesel']) } });

    const rail = await screen.findByRole('complementary', { name: 'Filters' });
    expect(within(rail).getByText('3')).toBeInTheDocument();
  });

  it('calls the collapse and clear handlers from accessible controls', async () => {
    const onToggleCollapsed = vi.fn();
    const onClear = vi.fn();
    const { user } = renderRail({ onToggleCollapsed, onClear });

    const rail = await screen.findByRole('complementary', { name: 'Filters' });
    await user.click(within(rail).getByRole('button', { name: 'Collapse filters' }));
    await user.click(within(rail).getByRole('button', { name: 'Clear all' }));

    expect(onToggleCollapsed).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('keeps rendering disabled zero-count filters when line facets fail to load', async () => {
    server.use(...scenarios.indentLinesServerError);
    renderRail();

    const rail = await screen.findByRole('complementary', { name: 'Filters' });
    for (const label of filterLabels) {
      expect(within(rail).getByText(label)).toBeInTheDocument();
    }
    expect(within(rail).getAllByRole('button', { name: 'All' })).toHaveLength(filterLabels.length);
  });
});

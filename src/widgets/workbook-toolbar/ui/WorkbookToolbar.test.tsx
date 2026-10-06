import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { apiUrl, at } from '@mocks/lib';
import { indentLineFixtures } from '@mocks/fixtures/indentLine';
import { server } from '@mocks/node';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { WorkbookToolbar } from './WorkbookToolbar';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

interface TestFilterToken {
  key: string;
  label: string;
  value: string;
}

const activeTokens = [
  { key: 'vertical', label: 'Vertical', value: 'LMD' },
  { key: 'fuel', label: 'Fuel', value: 'CNG' },
] satisfies TestFilterToken[];

const defaultProps = {
  vertical: 'lmd' as const,
  onVerticalChange: vi.fn<(vertical: 'lmd' | 'hd') => void>(),
  query: '',
  onQueryChange: vi.fn<(query: string) => void>(),
  tokens: activeTokens,
  onRemoveToken: vi.fn<(token: TestFilterToken) => void>(),
  onAddFert: vi.fn<() => void>(),
  onExport: vi.fn<() => void>(),
  density: 'comfortable' as const,
  onDensityChange: vi.fn<(density: 'comfortable' | 'compact') => void>(),
};

const renderToolbar = (props: Partial<typeof defaultProps> = {}) =>
  renderWithProviders(<WorkbookToolbar {...defaultProps} {...props} />, { preloadedState });

describe('WorkbookToolbar', () => {
  it('calls the vertical and search callbacks from accessible controls', async () => {
    const onVerticalChange = vi.fn<(vertical: 'lmd' | 'hd') => void>();
    const onQueryChange = vi.fn<(query: string) => void>();
    const { user } = renderToolbar({ onVerticalChange, onQueryChange });

    await user.selectOptions(screen.getByLabelText('Vertical'), 'hd');
    await user.type(screen.getByRole('searchbox', { name: 'Search FERT or description' }), 'V4010');

    expect(onVerticalChange).toHaveBeenCalledWith('hd');
    expect(onQueryChange).toHaveBeenLastCalledWith('V4010');
  });

  it('renders active filter chips and removes the selected token', async () => {
    const onRemoveToken = vi.fn<(token: TestFilterToken) => void>();
    const { user } = renderToolbar({ onRemoveToken });

    const filters = screen.getByRole('list', { name: 'Active filters' });
    expect(within(filters).getByText('Vertical: LMD')).toBeInTheDocument();
    expect(within(filters).getByText('Fuel: CNG')).toBeInTheDocument();

    await user.click(within(filters).getByRole('button', { name: 'Remove Fuel: CNG filter' }));

    expect(onRemoveToken).toHaveBeenCalledWith(at(activeTokens, 1));
    expect(screen.getByRole('button', { name: 'Clear all filters' })).toBeInTheDocument();
  });

  it('hides Clear all when there are no filters', () => {
    renderToolbar({ tokens: [] });

    expect(screen.queryByRole('list', { name: 'Active filters' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear all filters' })).not.toBeInTheDocument();
  });

  it('calls action and density callbacks', async () => {
    const onAddFert = vi.fn<() => void>();
    const onExport = vi.fn<() => void>();
    const onDensityChange = vi.fn<(density: 'comfortable' | 'compact') => void>();
    const { user } = renderToolbar({ onAddFert, onExport, onDensityChange });

    await user.click(screen.getByRole('button', { name: '+ Add FERT' }));
    await user.click(screen.getByRole('button', { name: 'Export' }));
    await user.click(screen.getByRole('button', { name: 'Compact density' }));

    expect(onAddFert).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onDensityChange).toHaveBeenCalledWith('compact');
  });

  it('derives the results count from indent-line query totalElements', async () => {
    server.use(
      http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () =>
        HttpResponse.json({ page: 0, size: 3, totalElements: 52, items: indentLineFixtures.slice(0, 3) }),
      ),
    );

    renderToolbar();

    expect(await screen.findByText('3 of 52 lines')).toBeInTheDocument();
  });
});

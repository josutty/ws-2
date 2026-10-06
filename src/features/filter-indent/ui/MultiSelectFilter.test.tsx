import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MultiSelectFilter } from './MultiSelectFilter';

const options = [
  { value: 'diesel', label: 'Diesel', count: 8 },
  { value: 'cng', label: 'CNG', sublabel: 'Compressed natural gas', count: 3 },
  { value: 'lpg', label: 'LPG', count: 0 },
];

const renderFilter = (props: Partial<Parameters<typeof MultiSelectFilter>[0]> = {}) => {
  const defaultProps = {
    label: 'Fuel',
    options,
    selected: new Set<string>(),
    onToggle: vi.fn(),
    onSearch: vi.fn(),
    query: '',
    onClear: vi.fn(),
  };

  return { user: userEvent.setup(), ...render(<MultiSelectFilter {...defaultProps} {...props} />) };
};

describe('MultiSelectFilter', () => {
  it('shows All while closed with no selected options', () => {
    renderFilter();

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
  });

  it('summarizes one selected option and multiple selected options while closed', () => {
    const { rerender } = renderFilter({ selected: new Set(['diesel']) });
    expect(screen.getByRole('button', { name: 'Diesel' })).toBeInTheDocument();

    rerender(
      <MultiSelectFilter
        label="Fuel"
        options={options}
        selected={new Set(['diesel', 'cng'])}
        onToggle={() => {}}
        onSearch={() => {}}
        query=""
        onClear={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: '2 selected' })).toBeInTheDocument();
  });

  it('opens a searchable listbox from the trigger', async () => {
    const { user } = renderFilter();

    await user.click(screen.getByRole('button', { name: 'All' }));

    const listbox = screen.getByRole('listbox');
    expect(screen.getByRole('textbox', { name: /search fuel/i })).toBeInTheDocument();
    expect(within(listbox).getByRole('option', { name: /Diesel/ })).toHaveAttribute('aria-selected', 'false');
    expect(within(listbox).getByRole('option', { name: /CNG/ })).toHaveTextContent('Compressed natural gas');
  });

  it('calls onToggle when an option is selected', async () => {
    const onToggle = vi.fn();
    const { user } = renderFilter({ onToggle });

    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.click(screen.getByRole('option', { name: /Diesel/ }));

    expect(onToggle).toHaveBeenCalledWith('diesel');
  });

  it('omits zero-count options unless they are already selected', async () => {
    const { rerender, user } = renderFilter();

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.queryByRole('option', { name: /LPG/ })).not.toBeInTheDocument();

    rerender(
      <MultiSelectFilter
        label="Fuel"
        options={options}
        selected={new Set(['lpg'])}
        onToggle={() => {}}
        onSearch={() => {}}
        query=""
        onClear={() => {}}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'LPG' }));
    expect(screen.getByRole('option', { name: /LPG/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows No match when search filters out every option', async () => {
    const { user } = renderFilter({ options: [], query: 'hydrogen' });

    await user.click(screen.getByRole('button', { name: 'All' }));

    expect(screen.getByText('No match')).toBeInTheDocument();
  });

  it('calls onSearch while typing in the search box', async () => {
    const onSearch = vi.fn();
    const { user } = renderFilter({ onSearch });

    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.type(screen.getByRole('textbox', { name: /search fuel/i }), 'di');

    expect(onSearch).toHaveBeenLastCalledWith('di');
  });

  it('splits pasted FERT codes for bulk selection when the optional paste handler is provided', async () => {
    const onPasteCodes = vi.fn();
    const { user } = renderFilter({ label: 'FERT', onPasteCodes });

    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.click(screen.getByRole('textbox', { name: /search fert/i }));
    await user.paste('V4000DSL, V4001CNG\nV4002LPG');

    expect(onPasteCodes).toHaveBeenCalledWith(['V4000DSL', 'V4001CNG', 'V4002LPG']);
  });
});

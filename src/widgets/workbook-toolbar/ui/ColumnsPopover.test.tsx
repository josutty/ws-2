import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColumnsPopover } from './ColumnsPopover';

const bands = [
  { key: 'vehicle', label: 'Vehicle attributes', colCount: 6, mode: 'summary' as const, hasSummary: true },
  { key: 'indent', label: 'Your indent', colCount: 7, mode: 'full' as const, hasSummary: false },
];

const defaultProps = {
  presets: ['Essentials', 'Stock focus', 'Trends', 'Everything'],
  activePreset: 'Essentials',
  bands,
  onSetPreset: vi.fn<(preset: string) => void>(),
  onSetBandMode: vi.fn<(key: string, mode: 'off' | 'summary' | 'full') => void>(),
  onClose: vi.fn<() => void>(),
};

const renderPopover = (props: Partial<typeof defaultProps> = {}) => {
  const user = userEvent.setup();
  return { user, ...render(<ColumnsPopover {...defaultProps} {...props} />) };
};

describe('ColumnsPopover', () => {
  it('renders preset chips and per-band controls when open', () => {
    renderPopover();

    const dialog = screen.getByRole('dialog', { name: 'Columns' });
    expect(within(dialog).getByRole('button', { name: 'Essentials' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(dialog).getByRole('button', { name: 'Stock focus' })).toBeInTheDocument();
    expect(within(dialog).getByText('Vehicle attributes')).toBeInTheDocument();
    expect(within(dialog).getByText('6 columns')).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: 'Vehicle attributes column mode' })).toBeInTheDocument();
  });

  it('calls onSetPreset when a preset chip is clicked', async () => {
    const onSetPreset = vi.fn<(preset: string) => void>();
    const { user } = renderPopover({ onSetPreset });

    await user.click(screen.getByRole('button', { name: 'Trends' }));

    expect(onSetPreset).toHaveBeenCalledWith('Trends');
  });

  it('calls onSetBandMode with full for the selected band', async () => {
    const onSetBandMode = vi.fn<(key: string, mode: 'off' | 'summary' | 'full') => void>();
    const { user } = renderPopover({ onSetBandMode });

    await user.click(within(screen.getByRole('group', { name: 'Vehicle attributes column mode' })).getByRole('button', { name: 'Full' }));

    expect(onSetBandMode).toHaveBeenCalledWith('vehicle', 'full');
  });

  it('omits Summary where a band has no summary mode', () => {
    renderPopover();

    const indentMode = screen.getByRole('group', { name: 'Your indent column mode' });
    expect(within(indentMode).getByRole('button', { name: 'Hide' })).toBeInTheDocument();
    expect(within(indentMode).queryByRole('button', { name: 'Summary' })).not.toBeInTheDocument();
    expect(within(indentMode).getByRole('button', { name: 'Full' })).toBeInTheDocument();
  });

  it('closes on outside click and Escape', async () => {
    const onClose = vi.fn<() => void>();
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">Outside target</button>
        <ColumnsPopover {...defaultProps} onClose={onClose} />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Outside target' }));
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

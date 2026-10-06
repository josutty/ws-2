import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableQtyCell } from './EditableQtyCell';

describe('EditableQtyCell', () => {
  it('renders the value in a labelled number input', () => {
    render(<EditableQtyCell value={12} onChange={() => {}} aria-label="July week 1 quantity for FERT-1042" />);
    const input = screen.getByLabelText('July week 1 quantity for FERT-1042');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveValue(12);
  });

  it('calls onChange with the parsed number while typing', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableQtyCell value={0} onChange={onChange} aria-label="qty" />);
    const input = screen.getByLabelText('qty');
    await user.clear(input);
    await user.type(input, '7');
    expect(onChange).toHaveBeenLastCalledWith(7);
  });

  it('renders a disabled input and blocks typing once submitted', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableQtyCell value={5} onChange={onChange} disabled aria-label="qty" />);
    const input = screen.getByLabelText('qty');
    expect(input).toBeDisabled();
    await user.type(input, '9');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows a "was {n}" carry-forward hint when priorValue is set and non-zero', () => {
    render(<EditableQtyCell value={0} priorValue={8} onChange={() => {}} aria-label="qty" />);
    expect(screen.getByText('was 8')).toBeInTheDocument();
  });

  it('omits the carry-forward hint when priorValue is undefined', () => {
    render(<EditableQtyCell value={0} onChange={() => {}} aria-label="qty" />);
    expect(screen.queryByText(/^was /)).not.toBeInTheDocument();
  });

  it('omits the carry-forward hint when priorValue is 0', () => {
    render(<EditableQtyCell value={0} priorValue={0} onChange={() => {}} aria-label="qty" />);
    expect(screen.queryByText(/^was /)).not.toBeInTheDocument();
  });

  it('forwards raw keydown events for arrow-key navigation', () => {
    const onKeyDown = vi.fn();
    render(<EditableQtyCell value={0} onChange={() => {}} onKeyDown={onKeyDown} aria-label="qty" />);
    fireEvent.keyDown(screen.getByLabelText('qty'), { key: 'ArrowRight' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onKeyDown.mock.calls[0]?.[0]).toMatchObject({ key: 'ArrowRight' });
  });

  it('forwards raw keydown events for Ctrl/Cmd+D fill-down', () => {
    const onKeyDown = vi.fn();
    render(<EditableQtyCell value={0} onChange={() => {}} onKeyDown={onKeyDown} aria-label="qty" />);
    const input = screen.getByLabelText('qty');
    fireEvent.keyDown(input, { key: 'd', ctrlKey: true });
    fireEvent.keyDown(input, { key: 'd', metaKey: true });
    expect(onKeyDown).toHaveBeenCalledTimes(2);
    expect(onKeyDown.mock.calls[0]?.[0]).toMatchObject({ key: 'd', ctrlKey: true });
    expect(onKeyDown.mock.calls[1]?.[0]).toMatchObject({ key: 'd', metaKey: true });
  });

  it('forwards the raw paste event for spreadsheet paste', () => {
    const onPaste = vi.fn();
    render(<EditableQtyCell value={0} onChange={() => {}} onPaste={onPaste} aria-label="qty" />);
    fireEvent.paste(screen.getByLabelText('qty'), { clipboardData: { getData: () => '10\t20\t30' } });
    expect(onPaste).toHaveBeenCalledTimes(1);
  });
});

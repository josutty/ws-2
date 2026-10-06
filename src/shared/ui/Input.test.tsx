import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('associates the label with the input', () => {
    render(<Input id="outlet-name" label="Outlet name" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Outlet name')).toBeInTheDocument();
  });

  it('calls onChange with the new value while typing', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input id="outlet-name" label="Outlet name" value="" onChange={onChange} />);
    await user.type(screen.getByLabelText('Outlet name'), 'A');
    expect(onChange).toHaveBeenCalledWith('A');
  });

  it('sets aria-invalid and shows error text linked by aria-describedby', () => {
    render(
      <Input id="outlet-name" label="Outlet name" value="" onChange={() => {}} error="Outlet name is required" />,
    );
    const input = screen.getByLabelText('Outlet name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(screen.getByText('Outlet name is required')).toHaveAttribute('id', describedBy);
  });
});

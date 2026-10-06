import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

const options = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
];

describe('Select', () => {
  it('associates the label with the select', () => {
    render(<Select id="region" label="Region" options={options} value="north" onChange={() => {}} />);
    expect(screen.getByLabelText('Region')).toBeInTheDocument();
  });

  it('calls onChange when an option is chosen', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Select id="region" label="Region" options={options} value="north" onChange={onChange} />);
    await user.selectOptions(screen.getByLabelText('Region'), 'south');
    expect(onChange).toHaveBeenCalledWith('south');
  });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it.each(['ok', 'warn', 'crit', 'add'] as const)('renders children for the %s tone', (tone) => {
    render(<Badge tone={tone}>On track</Badge>);
    expect(screen.getByText('On track')).toBeInTheDocument();
  });
});

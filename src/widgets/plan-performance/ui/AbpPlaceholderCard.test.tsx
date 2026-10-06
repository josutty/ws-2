import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AbpPlaceholderCard } from './AbpPlaceholderCard';

describe('AbpPlaceholderCard', () => {
  it('renders the permanent not-available state with the static dealer-level ABP explanation', () => {
    render(<AbpPlaceholderCard />);

    expect(screen.getByRole('heading', { name: 'Not yet available' })).toBeInTheDocument();
    expect(screen.getByText('Against ABP')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Dealer-level ABP targets are being introduced this year and aren't reliable enough to score against\. Your ASM sees the cluster figure\./i,
      ),
    ).toBeInTheDocument();
  });

  it('does not render retry, loading, or data-driven controls for the static ABP placeholder', () => {
    render(<AbpPlaceholderCard />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByText(/Retry/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
  });
});

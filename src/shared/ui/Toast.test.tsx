import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders nothing when message is null', () => {
    render(<Toast message={null} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders the message inside an aria-live status region when set', () => {
    render(<Toast message="Indent submitted" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Indent submitted');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});

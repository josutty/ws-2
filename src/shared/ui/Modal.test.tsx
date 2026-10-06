import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Modal } from './Modal';

function ModalHarness({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open modal</button>
      <Modal open={open} title="Add fertilizer" onClose={() => setOpen(false)}>
        <p>Modal body</p>
      </Modal>
    </div>
  );
}

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Modal open={false} title="Add fertilizer" onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders an accessible dialog when open', () => {
    render(
      <Modal open title="Add fertilizer" onClose={() => {}}>
        <p>Modal body</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Add fertilizer' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open title="Add fertilizer" onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus into the dialog on open and returns it to the trigger on close', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);
    const trigger = screen.getByRole('button', { name: 'Open modal' });
    trigger.focus();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Add fertilizer' });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

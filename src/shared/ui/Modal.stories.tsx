import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Button } from './Button';
import { Modal } from './Modal';

const meta = {
  component: Modal,
  tags: ['autodocs'],
  args: { open: true, title: 'Add fertilizer', onClose: fn() },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  render: (args) => <Modal {...args}>{args.children ?? <p>Modal body</p>}</Modal>,
};

export const WithSubtitleAndFooter: Story = {
  args: { subtitle: 'Cycle S&OP-1A · Jul 2026' },
  render: (args) => (
    <Modal {...args} footer={<Button variant="primary">Save</Button>}>
      {args.children ?? <p>Modal body</p>}
    </Modal>
  ),
};

export const Closed: Story = { args: { open: false } };

function InteractiveModal() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal open={open} title="Add fertilizer" onClose={() => setOpen(false)}>
        <p>Modal body</p>
      </Modal>
    </div>
  );
}

export const Interactive: Story = { render: () => <InteractiveModal /> };

import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta = {
  component: Toast,
  tags: ['autodocs'],
  args: { message: 'Indent submitted' },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Shown: Story = {};
export const Hidden: Story = { args: { message: null } };

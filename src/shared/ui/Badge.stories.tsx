import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  component: Badge,
  tags: ['autodocs'],
  args: { tone: 'ok', children: 'On track' },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Ok: Story = {};
export const Warn: Story = { args: { tone: 'warn', children: 'Not submitted' } };
export const Crit: Story = { args: { tone: 'crit', children: 'Not started' } };
export const Add: Story = { args: { tone: 'add', children: 'Added by dealer' } };

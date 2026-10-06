import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Button } from './Button';

const meta = {
  component: Button,
  tags: ['autodocs'],
  args: { variant: 'primary', children: 'Save', onClick: fn() },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Quiet: Story = { args: { variant: 'quiet' } };
export const Add: Story = { args: { variant: 'add', children: 'Add FERT' } };
export const Small: Story = { args: { size: 'sm' } };
export const Disabled: Story = { args: { disabled: true } };

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Input } from './Input';

const meta = {
  component: Input,
  tags: ['autodocs'],
  args: { id: 'outlet-name', label: 'Outlet name', value: '', onChange: fn() },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithValue: Story = { args: { value: 'Sharma Traders' } };
export const WithError: Story = { args: { error: 'Outlet name is required' } };
export const Disabled: Story = { args: { value: 'Sharma Traders', disabled: true } };

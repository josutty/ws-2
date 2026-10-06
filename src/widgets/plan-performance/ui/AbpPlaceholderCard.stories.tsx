import type { Meta, StoryObj } from '@storybook/react';
import { AbpPlaceholderCard } from './AbpPlaceholderCard';

const meta = {
  component: AbpPlaceholderCard,
  tags: ['autodocs'],
} satisfies Meta<typeof AbpPlaceholderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotAvailable: Story = {};

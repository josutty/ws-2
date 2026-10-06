import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { EditableQtyCell } from './EditableQtyCell';

const meta = {
  component: EditableQtyCell,
  tags: ['autodocs'],
  args: { value: 12, onChange: fn(), 'aria-label': 'July week 1 quantity for FERT-1042' },
} satisfies Meta<typeof EditableQtyCell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Editable: Story = {};
export const Locked: Story = { args: { disabled: true } };
export const CarryForwardHint: Story = { args: { value: 0, priorValue: 8 } };
export const NoHint: Story = { args: { value: 0, priorValue: 0 } };

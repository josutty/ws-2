import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ColumnsPopover } from './ColumnsPopover';

const bands = [
  { key: 'vehicle', label: 'Vehicle attributes', colCount: 6, mode: 'summary' as const, hasSummary: true },
  { key: 'stock', label: 'Stock position', colCount: 5, mode: 'summary' as const, hasSummary: true },
  { key: 'indent', label: 'Your indent', colCount: 7, mode: 'full' as const, hasSummary: false },
];

const meta = {
  component: ColumnsPopover,
  tags: ['autodocs'],
  args: {
    presets: ['Essentials', 'Stock focus', 'Trends', 'Everything'],
    activePreset: 'Essentials',
    bands,
    onSetPreset: fn(),
    onSetBandMode: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof ColumnsPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const NoActivePreset: Story = {
  args: { activePreset: null },
};

export const EverythingPreset: Story = {
  args: {
    activePreset: 'Everything',
    bands: bands.map((band) => ({ ...band, mode: 'full' as const })),
  },
};

export const SummaryUnavailable: Story = {
  args: {
    bands: [
      { key: 'indent', label: 'Your indent', colCount: 7, mode: 'full' as const, hasSummary: false },
      { key: 'commit', label: 'Commit controls', colCount: 3, mode: 'off' as const, hasSummary: false },
    ],
  },
};

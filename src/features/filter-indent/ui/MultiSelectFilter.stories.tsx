import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { indentLineFixtures } from '@mocks/fixtures/indentLine';
import { at } from '@mocks/lib';
import { MultiSelectFilter } from './MultiSelectFilter';

const lineOne = at(indentLineFixtures, 0);
const lineTwo = at(indentLineFixtures, 1);
const lineThree = at(indentLineFixtures, 2);

const fuelOptions = [
  { value: lineOne.product.fuel, label: lineOne.product.fuel, count: 18 },
  { value: lineTwo.product.fuel, label: lineTwo.product.fuel, sublabel: lineTwo.product.description, count: 11 },
  { value: lineThree.product.fuel, label: lineThree.product.fuel, count: 0 },
];

const fertOptions = [
  { value: lineOne.product.fertCode, label: lineOne.product.fertCode, sublabel: lineOne.product.description, count: 6 },
  { value: lineTwo.product.fertCode, label: lineTwo.product.fertCode, sublabel: lineTwo.product.description, count: 3 },
  { value: lineThree.product.fertCode, label: lineThree.product.fertCode, sublabel: lineThree.product.description, count: 0 },
];

const meta = {
  component: MultiSelectFilter,
  tags: ['autodocs'],
  args: {
    label: 'Fuel',
    options: fuelOptions,
    selected: new Set<string>(),
    onToggle: fn(),
    onSearch: fn(),
    query: '',
    onClear: fn(),
  },
} satisfies Meta<typeof MultiSelectFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ClosedAll: Story = {};

export const ClosedSingleSelection: Story = {
  args: { selected: new Set([lineOne.product.fuel]) },
};

export const ClosedMultipleSelection: Story = {
  args: { selected: new Set([lineOne.product.fuel, lineTwo.product.fuel]) },
};

export const Open: Story = {
  args: { selected: new Set([lineOne.product.fuel]) },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('button[aria-expanded="false"]');
    if (trigger instanceof HTMLButtonElement) trigger.click();
  },
};

export const NoMatch: Story = {
  args: { query: 'hydrogen', options: [] },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('button[aria-expanded="false"]');
    if (trigger instanceof HTMLButtonElement) trigger.click();
  },
};

export const FertPasteManyCodes: Story = {
  args: { label: 'FERT', options: fertOptions, onPasteCodes: fn() },
};

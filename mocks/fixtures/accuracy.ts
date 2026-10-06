import { faker } from '@faker-js/faker';
import type { AccuracyMonth, AccuracyRow } from '@shared/api/generated/models';
import { indentLineFixtures } from './indentLine';
import { outletFixtures } from './outlet';

const MONTHS = ['2026-03', '2026-04', '2026-05', '2026-06'];

faker.seed(5001);
const buildHistory = (): AccuracyMonth[] =>
  MONTHS.map((month) => {
    const indented = faker.number.int({ min: 40, max: 140 });
    const offtake = Math.max(0, indented + faker.number.int({ min: -20, max: 20 }));
    return { month, indented, offtake };
  });

export const accuracyByOutletFixtures: AccuracyRow[] = outletFixtures.map((outlet) => ({
  name: outlet.name,
  history: buildHistory(),
}));

// Top 25 FERTs, per AccuracyReportPanel's "By vehicle" view (analysis/components.md).
export const accuracyByFertFixtures: AccuracyRow[] = indentLineFixtures.slice(0, 25).map((line) => ({
  name: line.product.description,
  code: line.product.fertCode,
  history: buildHistory(),
}));

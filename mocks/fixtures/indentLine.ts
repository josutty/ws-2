import { faker } from '@faker-js/faker';
import type { IndentLine } from '@shared/api/generated/models';
import { buildIndentLine } from '../factories/indentLine';

const FUEL_SUFFIXES = ['LPG', 'CNG', 'DSL'] as const;

// 52 lines, 6 of them left blank — matches the DealerCycleSummary/CycleTotals example (lines: 52, blankLines: 6).
faker.seed(2001);
export const indentLineFixtures: IndentLine[] = Array.from({ length: 52 }, (_, i) =>
  buildIndentLine(
    {},
    { fertCode: `V${4000 + i}${faker.helpers.arrayElement(FUEL_SUFFIXES)}`, memberId: `P-FERT-${String(i + 1).padStart(3, '0')}` },
    { noEntry: i % 9 === 0 },
  ),
);

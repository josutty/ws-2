import type { CycleTotals, DealerCycleSummary } from '@shared/api/generated/models';
import { CLOSES_AT, CYCLE_ID, DEALER_CODE, DEALER_NAME } from '../constants';
import { indentLineFixtures } from './indentLine';

const sumPeriods = (periodIds: string[]): number =>
  indentLineFixtures.reduce(
    (total, line) => total + line.periods.filter((p) => periodIds.includes(p.periodId)).reduce((sum, p) => sum + p.value, 0),
    0,
  );

const totals: CycleTotals = {
  months: [
    { periodId: '2026-07', label: 'July (W1-W4)', value: sumPeriods(['2026-07-W1', '2026-07-W2', '2026-07-W3', '2026-07-W4']) },
    { periodId: '2026-08', label: 'August', value: sumPeriods(['2026-08']) },
    { periodId: '2026-09', label: 'September', value: sumPeriods(['2026-09']) },
  ],
  blankLines: indentLineFixtures.filter((line) => line.periods.every((p) => p.value === 0)).length,
};

export const dealerCycleSummaryFixture: DealerCycleSummary = {
  cycleId: CYCLE_ID,
  cycleLabel: 'S&OP-1A · July 2026',
  dealer: { code: DEALER_CODE, name: DEALER_NAME },
  status: 'DRAFT',
  closesAt: CLOSES_AT,
  lines: indentLineFixtures.length,
  totals,
  permissions: { canEdit: true, canAddFert: true, canSubmit: true },
};

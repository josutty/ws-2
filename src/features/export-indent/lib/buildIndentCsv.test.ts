import { describe, expect, it } from 'vitest';
import { dealerCycleSummaryFixture } from '@mocks/fixtures/cycleSummary';
import { indentLineFixtures } from '@mocks/fixtures/indentLine';
import { at } from '@mocks/lib';
import { buildIndentCsv } from './buildIndentCsv';

const expectedHeader = [
  'FERT Code',
  'Description',
  'Dealer Seg',
  'Eicher Seg',
  'Sub-vertical',
  'MPG',
  'Tonnage',
  'Fuel',
  'Cabin',
  'Stock <60D',
  'Stock 60-90D',
  'Stock 90-180D',
  'Stock >180D',
  'Stock Total',
  'Mth Opening Stk',
  'Live POs',
  'Offtake L3',
  'Offtake L6',
  'Offtake L12',
  'Offtake LYSM',
  'Retail L3',
  'Retail L6',
  'Retail L12',
  'Retail LYSM',
  'Last cycle',
  'W1',
  'W2',
  'W3',
  'W4',
  'Jul',
  'Aug',
  'Sep',
  'Total',
  'Added',
] as const;

const splitRows = (csv: string) => csv.split('\n').map((row) => row.split(','));

describe('buildIndentCsv', () => {
  it('returns the 34-column header row from FERT Code through Added', () => {
    const csv = buildIndentCsv([], dealerCycleSummaryFixture.dealer, dealerCycleSummaryFixture, 'all');

    const rows = splitRows(csv);
    expect(at(rows, 0)).toEqual(expectedHeader);
  });

  it('returns one data row per input line with deterministic cell values', () => {
    const firstLine = at(indentLineFixtures, 0);
    const secondLine = at(indentLineFixtures, 1);

    const csv = buildIndentCsv([firstLine, secondLine], dealerCycleSummaryFixture.dealer, dealerCycleSummaryFixture, 'all');

    const rows = splitRows(csv);
    expect(rows).toHaveLength(3);
    expect(at(rows, 1)).toHaveLength(expectedHeader.length);
    expect(at(rows, 1)).toEqual([
      firstLine.product.fertCode,
      `"${firstLine.product.description}"`,
      firstLine.product.application,
      firstLine.product.eicherSegment,
      firstLine.product.subVertical,
      firstLine.product.mpg,
      firstLine.product.tonnage,
      firstLine.product.fuel,
      firstLine.product.acType,
      String(firstLine.stockBreakdown.under60Days),
      String(firstLine.stockBreakdown.days60To90),
      String(firstLine.stockBreakdown.days90To180),
      String(firstLine.stockBreakdown.over180Days),
      String(firstLine.stockBreakdown.total),
      String(firstLine.livePosBreakdown.monthOpeningStock),
      String(firstLine.livePosBreakdown.livePos),
      String(firstLine.offTakeTrend.l3),
      String(firstLine.offTakeTrend.l6),
      String(firstLine.offTakeTrend.l12),
      String(firstLine.offTakeTrend.lysm),
      String(firstLine.retailTrend.l3),
      String(firstLine.retailTrend.l6),
      String(firstLine.retailTrend.l12),
      String(firstLine.retailTrend.lysm),
      String(firstLine.lastCycle),
      String(at(firstLine.periods, 0).value),
      String(at(firstLine.periods, 1).value),
      String(at(firstLine.periods, 2).value),
      String(at(firstLine.periods, 3).value),
      String(at(firstLine.periods, 0).value + at(firstLine.periods, 1).value + at(firstLine.periods, 2).value + at(firstLine.periods, 3).value),
      String(at(firstLine.periods, 4).value),
      String(at(firstLine.periods, 5).value),
      String(firstLine.periods.reduce((total, period) => total + period.value, 0)),
      'N',
    ]);
  });

  it('uses only the already-filtered lines passed by the caller when scope is filtered', () => {
    const omittedLine = at(indentLineFixtures, 0);
    const filteredLine = at(indentLineFixtures, 2);

    const csv = buildIndentCsv([filteredLine], dealerCycleSummaryFixture.dealer, dealerCycleSummaryFixture, 'filtered');

    expect(csv).toContain(filteredLine.product.fertCode);
    expect(csv).not.toContain(omittedLine.product.fertCode);
    expect(splitRows(csv)).toHaveLength(2);
  });

  it('is deterministic for the same seeded fixture input', () => {
    const lines = [at(indentLineFixtures, 3), at(indentLineFixtures, 4)];

    const first = buildIndentCsv(lines, dealerCycleSummaryFixture.dealer, dealerCycleSummaryFixture, 'all');
    const second = buildIndentCsv(lines, dealerCycleSummaryFixture.dealer, dealerCycleSummaryFixture, 'all');

    expect(second).toBe(first);
  });
});

import { faker } from '@faker-js/faker';
import type {
  DealerStockBreakdown,
  IndentLine,
  IndentPeriodCell,
  LivePosBreakdown,
  PipelineBreakdown,
  ProductReference,
  TrendBreakdown,
} from '@shared/api/generated/models';
import { buildProductReference } from './productReference';

const PERIODS: Array<{ periodId: string; label: string }> = [
  { periodId: '2026-07-W1', label: 'W1' },
  { periodId: '2026-07-W2', label: 'W2' },
  { periodId: '2026-07-W3', label: 'W3' },
  { periodId: '2026-07-W4', label: 'W4' },
  { periodId: '2026-08', label: 'August' },
  { periodId: '2026-09', label: 'September' },
];

const buildPeriodCells = (allZero: boolean): IndentPeriodCell[] =>
  PERIODS.map(({ periodId, label }) => ({
    periodId,
    label,
    value: allZero ? 0 : faker.number.int({ min: 0, max: 40 }),
    wasValue: allZero ? 0 : faker.number.int({ min: 0, max: 40 }),
    editable: true,
  }));

const buildStockBreakdown = (allZero: boolean): DealerStockBreakdown => {
  const under60Days = allZero ? 0 : faker.number.int({ min: 0, max: 10 });
  const days60To90 = allZero ? 0 : faker.number.int({ min: 0, max: 6 });
  const days90To180 = allZero ? 0 : faker.number.int({ min: 0, max: 4 });
  const over180Days = allZero ? 0 : faker.number.int({ min: 0, max: 3 });
  return { under60Days, days60To90, days90To180, over180Days, total: under60Days + days60To90 + days90To180 + over180Days };
};

const buildLivePosBreakdown = (allZero: boolean): LivePosBreakdown => ({
  monthOpeningStock: allZero ? 0 : faker.number.int({ min: 0, max: 15 }),
  livePos: allZero ? 0 : faker.number.int({ min: 0, max: 5 }),
});

const buildPipelineBreakdown = (allZero: boolean): PipelineBreakdown => ({
  confirmed: allZero ? 0 : faker.number.int({ min: 0, max: 60 }),
  fa: allZero ? 0 : faker.number.int({ min: 0, max: 45 }),
  fc: allZero ? 0 : faker.number.int({ min: 0, max: 30 }),
  hotInquiry: allZero ? 0 : faker.number.int({ min: 0, max: 20 }),
});

const buildTrendBreakdown = (allZero: boolean): TrendBreakdown => {
  const l3 = allZero ? 0 : faker.number.int({ min: 20, max: 120 });
  const l6 = allZero ? 0 : l3 + faker.number.int({ min: 20, max: 150 });
  const l12 = allZero ? 0 : l6 + faker.number.int({ min: 50, max: 200 });
  const lysm = allZero ? 0 : faker.number.int({ min: 20, max: 300 });
  return { l3, l6, l12, lysm };
};

export const buildIndentLine = (
  overrides: Partial<IndentLine> = {},
  productOverrides: Partial<ProductReference> = {},
  options: { noEntry?: boolean } = {},
): IndentLine => {
  const allZero = options.noEntry ?? false;
  const product = buildProductReference(productOverrides);
  const stockBreakdown = buildStockBreakdown(allZero);
  const livePosBreakdown = buildLivePosBreakdown(allZero);
  const offTakeTrend = buildTrendBreakdown(allZero);
  const retailTrend = buildTrendBreakdown(allZero);

  return {
    lineId: `line-${product.fertCode}`,
    product,
    stock: stockBreakdown.total,
    stockBreakdown,
    livePos: livePosBreakdown.livePos,
    livePosBreakdown,
    pipeline: buildPipelineBreakdown(allZero),
    offTakeL3: offTakeTrend.l3,
    offTakeTrend,
    retailL3: retailTrend.l3,
    retailTrend,
    lastCycle: allZero ? 0 : faker.number.int({ min: 0, max: 120 }),
    periods: buildPeriodCells(allZero),
    version: 1,
    ...overrides,
  };
};

/** Zero-valued line for a FERT freshly added via AddFertModal (addDealerIndentLine). */
export const buildAddedIndentLine = (product: ProductReference): IndentLine => ({
  lineId: `line-${product.fertCode}`,
  product,
  stock: 0,
  stockBreakdown: { under60Days: 0, days60To90: 0, days90To180: 0, over180Days: 0, total: 0 },
  livePos: 0,
  livePosBreakdown: { monthOpeningStock: 0, livePos: 0 },
  pipeline: { confirmed: 0, fa: 0, fc: 0, hotInquiry: 0 },
  offTakeL3: 0,
  offTakeTrend: { l3: 0, l6: 0, l12: 0, lysm: 0 },
  retailL3: 0,
  retailTrend: { l3: 0, l6: 0, l12: 0, lysm: 0 },
  lastCycle: 0,
  periods: buildPeriodCells(true),
  version: 0,
});

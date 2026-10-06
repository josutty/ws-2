import type { CurrentCyclePreview, DealerCycleSummary, DealerReference, IndentLine } from '@shared/api/generated/models';

export type ExportIndentScope = 'all' | 'filtered';

const HEADER = [
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

export function buildIndentCsv(
  lines: IndentLine[],
  dealer: DealerReference,
  cycle: CurrentCyclePreview | DealerCycleSummary,
  scope: ExportIndentScope,
): string {
  void dealer;
  void cycle;
  void scope;
  return [HEADER.join(','), ...lines.map((line) => buildLineRow(line).join(','))].join('\n');
}

function buildLineRow(line: IndentLine): string[] {
  const [w1, w2, w3, w4, august, september] = line.periods;
  const julyTotal = toValue(w1) + toValue(w2) + toValue(w3) + toValue(w4);
  const total = line.periods.reduce((sum, period) => sum + period.value, 0);

  return [
    line.product.fertCode,
    csvCell(line.product.description, true),
    line.product.application,
    line.product.eicherSegment ?? '',
    line.product.subVertical ?? '',
    line.product.mpg ?? '',
    line.product.tonnage,
    line.product.fuel,
    line.product.acType ?? '',
    String(line.stockBreakdown.under60Days),
    String(line.stockBreakdown.days60To90),
    String(line.stockBreakdown.days90To180),
    String(line.stockBreakdown.over180Days),
    String(line.stockBreakdown.total),
    String(line.livePosBreakdown.monthOpeningStock),
    String(line.livePosBreakdown.livePos),
    String(line.offTakeTrend.l3),
    String(line.offTakeTrend.l6),
    String(line.offTakeTrend.l12),
    String(line.offTakeTrend.lysm),
    String(line.retailTrend.l3),
    String(line.retailTrend.l6),
    String(line.retailTrend.l12),
    String(line.retailTrend.lysm),
    String(line.lastCycle),
    String(toValue(w1)),
    String(toValue(w2)),
    String(toValue(w3)),
    String(toValue(w4)),
    String(julyTotal),
    String(toValue(august)),
    String(toValue(september)),
    String(total),
    line.version === 0 ? 'Y' : 'N',
  ];
}

function toValue(period: IndentLine['periods'][number] | undefined): number {
  return period?.value ?? 0;
}

function csvCell(value: string, alwaysQuote = false): string {
  const escaped = value.replaceAll('"', '""');
  return alwaysQuote || /[",\n]/.test(value) ? `"${escaped}"` : escaped;
}

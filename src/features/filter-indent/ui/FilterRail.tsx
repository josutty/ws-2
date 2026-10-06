import { useMemo, useState } from 'react';
import type { IndentLine } from '@shared/api';
import { useListDealerIndentLinesQuery } from '@entities/indent-line';
import { MultiSelectFilter, type MultiSelectFilterOption } from './MultiSelectFilter';

export type FilterKey =
  | 'vertical'
  | 'fert'
  | 'subVertical'
  | 'demandSegment'
  | 'mpgModel'
  | 'tonnage'
  | 'fuel'
  | 'cabin'
  | 'fertHistory'
  | 'status';

export interface FilterRailProps {
  filters: Record<FilterKey, Set<string>>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onChangeFilter: (key: FilterKey, values: Set<string>) => void;
  onClear: () => void;
}

interface FilterDefinition {
  key: FilterKey;
  label: string;
  getValue: (line: IndentLine) => string | undefined;
  getSublabel?: (line: IndentLine) => string | undefined;
}

const FILTER_DEFINITIONS: FilterDefinition[] = [
  { key: 'vertical', label: 'Vertical', getValue: (line) => getVertical(line) },
  { key: 'fert', label: 'FERT', getValue: (line) => line.product.fertCode, getSublabel: (line) => line.product.description },
  { key: 'subVertical', label: 'Sub-vertical', getValue: (line) => line.product.subVertical },
  { key: 'demandSegment', label: 'Demand segment', getValue: (line) => line.product.eicherSegment ?? line.product.application },
  { key: 'mpgModel', label: 'MPG model', getValue: (line) => line.product.mpg ?? line.product.model },
  { key: 'tonnage', label: 'Tonnage', getValue: (line) => line.product.tonnage },
  { key: 'fuel', label: 'Fuel', getValue: (line) => line.product.fuel },
  { key: 'cabin', label: 'Cabin', getValue: (line) => line.product.acType },
  { key: 'fertHistory', label: 'FERT History', getValue: (line) => getFertHistory(line) },
  { key: 'status', label: 'Status', getValue: (line) => getLineStatus(line) },
];

const DEFAULT_VALUES: Record<FilterKey, string[]> = {
  vertical: ['LMD', 'HD'],
  fert: [],
  subVertical: ['<5T', '5-16T', '16-25T', '>25T'],
  demandSegment: ['Repeater', 'Runner', 'Stranger'],
  mpgModel: [],
  tonnage: ['5T', '7T', '9T', '14T', '19T', '25T'],
  fuel: ['Diesel', 'CNG', 'LPG'],
  cabin: ['AC', 'Non-AC'],
  fertHistory: ['New FERT', 'Prior-cycle FERT'],
  status: ['No entry', 'In progress'],
};

const EMPTY_QUERIES: Record<FilterKey, string> = {
  vertical: '',
  fert: '',
  subVertical: '',
  demandSegment: '',
  mpgModel: '',
  tonnage: '',
  fuel: '',
  cabin: '',
  fertHistory: '',
  status: '',
};

const RAIL_BASE = 'relative z-10 shrink-0 border-border bg-surface text-fg md:sticky md:top-0 md:h-full';
const COUNT_BADGE = 'inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-caption font-bold text-primary-fg';

export function FilterRail({ filters, collapsed, onToggleCollapsed, onChangeFilter, onClear }: FilterRailProps) {
  const { data } = useListDealerIndentLinesQuery({ size: 200, includeReference: true });
  const [queries, setQueries] = useState<Record<FilterKey, string>>(EMPTY_QUERIES);
  const optionsByKey = useMemo(() => buildOptionsByKey(data?.items ?? []), [data]);
  const activeCount = getActiveCount(filters);

  const updateQuery = (key: FilterKey, value: string) => setQueries((current) => ({ ...current, [key]: value }));
  const toggleValue = (key: FilterKey, value: string) => {
    const nextValues = new Set(getSelected(filters, key));
    if (nextValues.has(value)) nextValues.delete(value);
    else nextValues.add(value);
    onChangeFilter(key, nextValues);
  };
  const clearValue = (key: FilterKey) => onChangeFilter(key, new Set<string>());
  const pasteFertCodes = (codes: string[]) => onChangeFilter('fert', new Set([...getSelected(filters, 'fert'), ...codes]));

  if (collapsed) {
    return (
      <aside aria-label="Filters" className={`${RAIL_BASE} w-14 border-r p-2`}>
        <button
          type="button"
          aria-label="Expand filters"
          aria-expanded={false}
          onClick={onToggleCollapsed}
          className="flex h-full min-h-64 w-full flex-col items-center gap-3 rounded-card border border-border bg-surface-muted px-2 py-3 hover:bg-surface"
        >
          <span className={COUNT_BADGE}>{activeCount}</span>
          <span className="origin-center rotate-180 text-caption font-bold uppercase tracking-label text-fg-muted [writing-mode:vertical-rl]">Filters</span>
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Filters" className={`${RAIL_BASE} w-80 border-r p-4 max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:shadow-elevated`}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-title-sm font-bold text-fg">Filters</h2>
            <span className={COUNT_BADGE}>{activeCount}</span>
          </div>
          <button
            type="button"
            aria-label="Collapse filters"
            aria-expanded={true}
            onClick={onToggleCollapsed}
            className="min-h-8 rounded-control border border-border-strong px-2 text-body-sm text-fg hover:bg-surface-muted"
          >
            ‹
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {FILTER_DEFINITIONS.map(({ key, label }) => (
            <MultiSelectFilter
              key={key}
              label={label}
              options={optionsByKey[key]}
              selected={getSelected(filters, key)}
              onToggle={(value) => toggleValue(key, value)}
              onSearch={(term) => updateQuery(key, term)}
              query={queries[key]}
              onClear={() => clearValue(key)}
              onPasteCodes={key === 'fert' ? pasteFertCodes : undefined}
            />
          ))}
        </div>

        <div className="border-t border-border pt-3">
          <button type="button" onClick={onClear} className="w-full rounded-control border border-border-strong px-3 py-2 text-body font-medium text-fg hover:bg-surface-muted">
            Clear all
          </button>
        </div>
      </div>
    </aside>
  );
}

function buildOptionsByKey(lines: IndentLine[]): Record<FilterKey, MultiSelectFilterOption[]> {
  return Object.fromEntries(
    FILTER_DEFINITIONS.map((definition) => [definition.key, buildOptions(lines, definition, DEFAULT_VALUES[definition.key])]),
  ) as Record<FilterKey, MultiSelectFilterOption[]>;
}

function buildOptions(lines: IndentLine[], definition: FilterDefinition, defaultValues: string[]): MultiSelectFilterOption[] {
  const counts = new Map<string, MultiSelectFilterOption>();
  for (const value of defaultValues) counts.set(value, { value, label: value, count: 0 });

  for (const line of lines) {
    const value = definition.getValue(line);
    if (!value) continue;
    const current = counts.get(value) ?? { value, label: value, sublabel: definition.getSublabel?.(line), count: 0 };
    counts.set(value, { ...current, count: current.count + 1 });
  }

  return Array.from(counts.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function getActiveCount(filters: Record<FilterKey, Set<string>>) {
  return Object.values(filters).reduce((total, values) => total + values.size, 0);
}

function getSelected(filters: Record<FilterKey, Set<string>>, key: FilterKey) {
  return filters[key];
}

function getVertical(line: IndentLine) {
  const subVertical = line.product.subVertical ?? '';
  return subVertical.includes('25') || subVertical.startsWith('>') ? 'HD' : 'LMD';
}

function getFertHistory(line: IndentLine) {
  return line.lastCycle > 0 ? 'Prior-cycle FERT' : 'New FERT';
}

function getLineStatus(line: IndentLine) {
  return line.periods.some((period) => period.value > 0) ? 'In progress' : 'No entry';
}

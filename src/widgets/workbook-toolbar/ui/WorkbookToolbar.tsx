import { useEffect, useState } from 'react';
import { useListDealerIndentLinesQuery } from '@entities/indent-line';
import { Button, Input, Select } from '@shared/ui';
import { ColumnsPopover, type ColumnBand, type ColumnBandMode } from './ColumnsPopover';

export type WorkbookVertical = 'lmd' | 'hd';
export type WorkbookDensity = 'comfortable' | 'compact';

export interface FilterToken {
  key: string;
  label: string;
  value: string;
}

export interface WorkbookToolbarProps {
  vertical: WorkbookVertical;
  onVerticalChange: (vertical: WorkbookVertical) => void;
  query: string;
  onQueryChange: (query: string) => void;
  tokens: FilterToken[];
  onRemoveToken: (token: FilterToken) => void;
  onAddFert: () => void;
  onExport: () => void;
  density: WorkbookDensity;
  onDensityChange: (density: WorkbookDensity) => void;
}

const VERTICAL_OPTIONS = [
  { value: 'lmd', label: 'LMD' },
  { value: 'hd', label: 'HD' },
];

const COLUMN_PRESETS = ['Essentials', 'Stock focus', 'Trends', 'Everything'];

const INITIAL_BANDS: ColumnBand[] = [
  { key: 'vehicle', label: 'Vehicle attributes', colCount: 6, mode: 'summary', hasSummary: true },
  { key: 'stock', label: 'Stock position', colCount: 5, mode: 'summary', hasSummary: true },
  { key: 'indent', label: 'Your indent', colCount: 7, mode: 'full', hasSummary: false },
  { key: 'commit', label: 'Commit controls', colCount: 3, mode: 'off', hasSummary: false },
];

export function WorkbookToolbar({
  vertical,
  onVerticalChange,
  query,
  onQueryChange,
  tokens,
  onRemoveToken,
  onAddFert,
  onExport,
  density,
  onDensityChange,
}: WorkbookToolbarProps) {
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(query);
  const [activePreset, setActivePreset] = useState<string | null>('Essentials');
  const [bands, setBands] = useState<ColumnBand[]>(INITIAL_BANDS);
  const { data } = useListDealerIndentLinesQuery({
    page: 0,
    size: 3,
    includeReference: true,
    search: query || undefined,
  });
  const visibleCount = data?.items.length ?? 0;
  const totalCount = data?.totalElements ?? visibleCount;

  useEffect(() => setSearchValue(query), [query]);

  const changeQuery = (value: string) => {
    setSearchValue(value);
    onQueryChange(value);
  };
  const clearFilters = () => tokens.forEach((token) => onRemoveToken(token));
  const setBandMode = (key: string, mode: ColumnBandMode) => {
    setActivePreset(null);
    setBands((current) => current.map((band) => (band.key === key ? { ...band, mode } : band)));
  };
  const selectPreset = (preset: string) => {
    setActivePreset(preset);
    setBands((current) => current.map((band) => ({ ...band, mode: preset === 'Everything' ? 'full' : band.mode })));
  };

  return (
    <section aria-label="Workbook toolbar" className="relative border-b border-border bg-surface px-4 py-3 text-fg">
      <div className="overflow-x-auto">
        <div className="flex min-w-max items-end gap-3">
          <Select
            id="workbook-vertical"
            label="Vertical"
            options={VERTICAL_OPTIONS}
            value={vertical}
            onChange={(value) => onVerticalChange(value as WorkbookVertical)}
          />
          <Input
            id="workbook-search"
            label="Search FERT or description"
            type="search"
            value={searchValue}
            onChange={changeQuery}
            autoComplete="off"
          />
          {tokens.length > 0 ? (
            <div className="flex flex-col gap-1">
              <span className="text-body-sm text-fg-muted">Filters</span>
              <ul aria-label="Active filters" className="flex items-center gap-2">
                {tokens.map((token) => {
                  const text = `${token.label}: ${token.value}`;
                  return (
                    <li key={`${token.key}:${token.value}`} className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-3 py-1 text-body-sm text-fg">
                      <span>{text}</span>
                      <button type="button" aria-label={`Remove ${text} filter`} onClick={() => onRemoveToken(token)} className="rounded-full px-1 text-fg-muted hover:bg-surface">
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
          {tokens.length > 0 ? (
            <button type="button" aria-label="Clear all filters" onClick={clearFilters} className="h-[27px] rounded-control px-3 text-body-sm font-medium text-fg-muted hover:bg-surface-muted">
              Clear all
            </button>
          ) : null}
          <p className="pb-1 text-body-sm font-medium tabular-nums text-fg-muted" aria-live="polite">{visibleCount} of {totalCount} lines</p>
          <Button variant="add" onClick={onAddFert}>+ Add FERT</Button>
          <Button variant="ghost" onClick={onExport}>Export</Button>
          <div className="flex items-center gap-1 rounded-control border border-border bg-surface-muted p-1" aria-label="Density">
            <button type="button" aria-pressed={density === 'comfortable'} onClick={() => onDensityChange('comfortable')} className="rounded-control px-3 py-1.5 text-body-sm font-medium text-fg hover:bg-surface">
              Comfortable density
            </button>
            <button type="button" aria-pressed={density === 'compact'} onClick={() => onDensityChange('compact')} className="rounded-control px-3 py-1.5 text-body-sm font-medium text-fg hover:bg-surface">
              Compact density
            </button>
          </div>
          <button type="button" aria-expanded={columnsOpen} onClick={() => setColumnsOpen((open) => !open)} className="h-8 rounded-control border border-border-strong bg-surface px-4 text-body font-medium text-fg hover:bg-surface-muted">
            ☷ Columns
          </button>
        </div>
      </div>
      {columnsOpen ? (
        <div className="absolute right-4 top-full z-20 mt-2">
          <ColumnsPopover presets={COLUMN_PRESETS} activePreset={activePreset} bands={bands} onSetPreset={selectPreset} onSetBandMode={setBandMode} onClose={() => setColumnsOpen(false)} />
        </div>
      ) : null}
    </section>
  );
}

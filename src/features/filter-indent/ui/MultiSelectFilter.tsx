import type { ChangeEvent, ClipboardEvent } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface MultiSelectFilterOption {
  value: string;
  label: string;
  sublabel?: string;
  count: number;
}

export interface MultiSelectFilterProps {
  label: string;
  options: MultiSelectFilterOption[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  onSearch: (term: string) => void;
  query: string;
  onClear: () => void;
  onPasteCodes?: (codes: string[]) => void;
}

const TRIGGER_BASE =
  'flex h-8 w-full items-center justify-between rounded-control border border-border-strong bg-surface px-3 text-left text-body text-fg hover:bg-surface-muted';
const CLEAR_ACTIVE = 'text-primary hover:underline font-medium';
const CLEAR_INACTIVE = 'text-fg-subtle cursor-not-allowed';
const SEARCH_INPUT = 'h-8 w-full rounded-control border border-border-strong bg-surface px-3 text-body text-fg';
const OPTION_BASE = 'flex w-full items-start justify-between gap-3 rounded-control px-2 py-1.5 text-left hover:bg-surface-muted';
const OPTION_SELECTED = 'bg-primary-soft text-primary';
const OPTION_UNSELECTED = 'bg-transparent text-fg';

const splitCodes = (text: string) => text.split(/[,\s]+/u).map((code) => code.trim()).filter(Boolean);

export function MultiSelectFilter({
  label,
  options,
  selected,
  onToggle,
  onSearch,
  query,
  onClear,
  onPasteCodes,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(query);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const listboxId = useId();
  const selectedCount = selected.size;

  useEffect(() => setSearchValue(query), [query]);

  useEffect(() => setIsOpen(false), [selectedCount]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node) === false) setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const summary = useMemo(() => {
    if (selectedCount === 0) return 'All';
    if (selectedCount > 1) return `${selectedCount} selected`;

    const selectedValue = Array.from(selected)[0];
    return options.find((option) => option.value === selectedValue)?.label ?? selectedValue ?? '1 selected';
  }, [options, selected, selectedCount]);

  const visibleOptions = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLocaleLowerCase();

    return options.filter((option) => {
      if (option.count === 0 && !selected.has(option.value)) return false;
      if (normalizedQuery.length === 0) return true;

      const haystack = `${option.value} ${option.label} ${option.sublabel ?? ''}`.toLocaleLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [options, searchValue, selected]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setSearchValue(nextValue);
    onSearch(nextValue);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (!onPasteCodes) return;

    const codes = splitCodes(event.clipboardData.getData('text'));
    if (codes.length === 0) return;

    event.preventDefault();
    onPasteCodes(codes);
  };

  const clearClassName = selectedCount > 0 ? CLEAR_ACTIVE : CLEAR_INACTIVE;

  return (
    <section ref={rootRef} className="relative space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-caption font-bold uppercase tracking-label text-fg-muted">{label}</h3>
        <button type="button" onClick={onClear} disabled={selectedCount === 0} className={`text-caption ${clearClassName}`}>
          Clear
        </button>
      </div>

      <button
        type="button"
        className={`${TRIGGER_BASE} ${selectedCount === 0 ? 'text-fg-muted' : 'text-fg'}`}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{summary}</span>
        <span aria-hidden="true" className="text-fg-subtle">⌄</span>
      </button>

      {isOpen ? (
        <div className="absolute z-20 mt-1 w-full rounded-card border border-border bg-surface p-2 shadow-elevated">
          <label htmlFor={searchId} className="sr-only">Search {label}</label>
          <input
            id={searchId}
            type="text"
            value={searchValue}
            onChange={handleSearch}
            onPaste={handlePaste}
            className={SEARCH_INPUT}
            placeholder={`Search ${label}`}
          />

          <div id={listboxId} role="listbox" aria-label={`${label} options`} className="mt-2 max-h-56 overflow-y-auto">
            {visibleOptions.length > 0 ? (
              <ul className="space-y-1">
                {visibleOptions.map((option) => {
                  const isSelected = selected.has(option.value);
                  const optionClassName = `${OPTION_BASE} ${isSelected ? OPTION_SELECTED : OPTION_UNSELECTED}`;

                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={optionClassName}
                        onClick={() => onToggle(option.value)}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{option.label}</span>
                          {option.sublabel ? <span className="block truncate text-caption text-fg-subtle">{option.sublabel}</span> : null}
                        </span>
                        <span className="font-mono text-caption tabular-nums text-fg-subtle">{option.count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-2 py-3 text-body-sm text-fg-muted">No match</p>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border-soft pt-2 text-caption text-fg-subtle">
            <button type="button" onClick={onClear} disabled={selectedCount === 0} className={clearClassName}>
              Clear
            </button>
            <span>{selectedCount} of {options.length}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

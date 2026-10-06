import { useEffect, useRef } from 'react';

export type ColumnBandMode = 'off' | 'summary' | 'full';

export interface ColumnBand {
  key: string;
  label: string;
  colCount: number;
  mode: ColumnBandMode;
  hasSummary: boolean;
}

export interface ColumnsPopoverProps {
  presets: string[];
  activePreset: string | null;
  bands: ColumnBand[];
  onSetPreset: (preset: string) => void;
  onSetBandMode: (key: string, mode: ColumnBandMode) => void;
  onClose: () => void;
}

const MODE_LABELS: Record<ColumnBandMode, string> = {
  off: 'Hide',
  summary: 'Summary',
  full: 'Full',
};

const MODE_ORDER: ColumnBandMode[] = ['off', 'summary', 'full'];

const BUTTON_BASE = 'rounded-control px-3 py-1.5 text-body-sm font-medium';
const BUTTON_ACTIVE = 'bg-primary text-primary-fg';
const BUTTON_INACTIVE = 'bg-surface text-fg-muted border border-border hover:bg-surface-muted hover:border-border-strong';

const getModeOptions = (band: ColumnBand) => MODE_ORDER.filter((mode) => mode !== 'summary' || band.hasSummary);

export function ColumnsPopover({
  presets,
  activePreset,
  bands,
  onSetPreset,
  onSetBandMode,
  onClose,
}: ColumnsPopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node) === false) onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Columns"
      className="w-[min(31rem,calc(100vw-2rem))] rounded-card border border-border bg-surface p-4 text-body text-fg shadow-elevated"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-heading-3 text-fg">Columns</h2>
          <p className="mt-1 text-body-sm text-fg-muted">Choose a preset or tune each column band.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-control px-2 py-1 text-body-sm text-fg-muted hover:bg-surface-muted" aria-label="Close columns">
          ×
        </button>
      </div>

      <section className="mt-4" aria-labelledby="column-presets-heading">
        <h3 id="column-presets-heading" className="text-caption font-bold uppercase tracking-label text-fg-muted">Presets</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((preset) => {
            const isActive = preset === activePreset;
            const className = `${BUTTON_BASE} ${isActive ? BUTTON_ACTIVE : BUTTON_INACTIVE}`;

            return (
              <button key={preset} type="button" aria-pressed={isActive} onClick={() => onSetPreset(preset)} className={className}>
                {preset}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5" aria-labelledby="column-bands-heading">
        <h3 id="column-bands-heading" className="text-caption font-bold uppercase tracking-label text-fg-muted">Bands</h3>
        <ul className="mt-2 divide-y divide-border-soft rounded-card border border-border">
          {bands.map((band) => (
            <li key={band.key} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-fg">{band.label}</p>
                <p className="font-mono text-caption tabular-nums text-fg-subtle">{band.colCount} columns</p>
              </div>
              <div role="group" aria-label={`${band.label} column mode`} className="inline-flex flex-wrap gap-2">
                {getModeOptions(band).map((mode) => {
                  const isActive = mode === band.mode;
                  const className = `${BUTTON_BASE} ${isActive ? BUTTON_ACTIVE : BUTTON_INACTIVE}`;

                  return (
                    <button key={mode} type="button" aria-pressed={isActive} onClick={() => onSetBandMode(band.key, mode)} className={className}>
                      {MODE_LABELS[mode]}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

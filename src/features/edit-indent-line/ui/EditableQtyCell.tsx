import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';

export interface EditableQtyCellProps {
  value: number;
  priorValue?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: ClipboardEvent<HTMLInputElement>) => void;
  'aria-label': string;
}

const FIELD_DEFAULT = 'h-8 w-full rounded-xs px-2 bg-surface text-fg border border-border-strong font-mono tabular-nums focus-visible:ring-2 focus-visible:ring-focus';
const FIELD_DISABLED = 'h-8 w-full rounded-xs px-2 bg-surface-muted text-fg-muted border border-border font-mono tabular-nums cursor-not-allowed';

export function EditableQtyCell({
  value,
  priorValue,
  disabled,
  onChange,
  onKeyDown,
  onPaste,
  'aria-label': ariaLabel,
}: EditableQtyCellProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value));
  const showHint = priorValue !== undefined && priorValue !== 0;

  return (
    <div className="flex flex-col gap-0.5">
      <input
        type="number"
        min={0}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        disabled={disabled}
        aria-label={ariaLabel}
        className={disabled ? FIELD_DISABLED : FIELD_DEFAULT}
      />
      {showHint ? <span className="text-caption text-fg-subtle">was {priorValue}</span> : null}
    </div>
  );
}

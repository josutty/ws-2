import type { ChangeEvent } from 'react';

export interface InputProps {
  id: string;
  label: string;
  type?: 'text' | 'number' | 'password' | 'search';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  min?: number;
}

const FIELD_BASE = 'h-8 rounded-control px-3';
const FIELD_DEFAULT = `${FIELD_BASE} bg-surface text-fg border border-border-strong focus-visible:ring-2 focus-visible:ring-focus`;
const FIELD_INVALID = `${FIELD_BASE} bg-surface text-fg border border-danger focus-visible:ring-2 focus-visible:ring-danger`;
const FIELD_DISABLED = `${FIELD_BASE} bg-surface-muted text-fg-muted border border-border cursor-not-allowed`;

export function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  disabled,
  autoComplete,
  min,
}: InputProps) {
  const errorId = `${id}-error`;
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);
  const fieldClassName = disabled ? FIELD_DISABLED : error ? FIELD_INVALID : FIELD_DEFAULT;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-body-sm text-fg-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        autoComplete={autoComplete}
        min={min}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={fieldClassName}
      />
      {error ? (
        <span id={errorId} className="text-caption text-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}

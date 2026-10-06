import type { ReactNode } from 'react';

export interface ButtonProps {
  variant: 'primary' | 'ghost' | 'quiet' | 'add';
  size?: 'default' | 'sm';
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonProps['variant'], string> = {
  primary:
    'bg-primary text-primary-fg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed rounded-control',
  ghost:
    'bg-surface text-fg-muted border border-border hover:bg-surface-muted hover:border-border-strong rounded-control',
  quiet: 'bg-transparent text-fg-muted hover:bg-surface-muted rounded-control',
  add: 'bg-surface text-add border border-add hover:bg-add-soft rounded-control',
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-8 px-4 text-body',
  sm: 'h-[27px] px-3 text-body-sm',
};

export function Button({ variant, size = 'default', disabled, type = 'button', onClick, children }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-medium disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`}
    >
      {children}
    </button>
  );
}

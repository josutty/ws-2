import type { ReactNode } from 'react';

export interface BadgeProps {
  tone: 'ok' | 'warn' | 'crit' | 'add';
  children: ReactNode;
}

const TONE_CLASSES: Record<BadgeProps['tone'], string> = {
  ok: 'bg-success-soft text-success',
  warn: 'bg-warning-soft text-warning',
  crit: 'bg-danger-soft text-danger',
  add: 'bg-add-soft text-add',
};

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span
      className={`rounded-xs px-2 py-0.5 text-caption font-bold uppercase tracking-label ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

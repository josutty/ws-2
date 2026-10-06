import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

// Every color is a CSS-variable channel triplet so opacity modifiers work (bg-primary/90).
const token = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: { DEFAULT: token('surface'), muted: token('surface-muted'), hover: token('surface-hover') },
        topbar: { DEFAULT: token('topbar'), fg: token('topbar-fg') },
        fg: { DEFAULT: token('fg'), muted: token('fg-muted'), subtle: token('fg-subtle') },
        border: { DEFAULT: token('border'), soft: token('border-soft'), strong: token('border-strong') },
        primary: { DEFAULT: token('primary'), hover: token('primary-hover'), soft: token('primary-soft'), fg: token('primary-fg') },
        success: { DEFAULT: token('success'), soft: token('success-soft'), fg: token('success-fg') },
        warning: { DEFAULT: token('warning'), soft: token('warning-soft'), strong: token('warning-strong'), fg: token('warning-fg') },
        danger: { DEFAULT: token('danger'), soft: token('danger-soft'), fg: token('danger-fg') },
        add: { DEFAULT: token('add'), soft: token('add-soft'), fg: token('add-fg') },
        focus: token('focus'),
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'heading-1': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em', fontWeight: '600' }],
        'heading-2': ['1.1875rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'heading-3': ['1.0625rem', { lineHeight: '1.375rem', fontWeight: '600' }],
        body: ['0.84375rem', { lineHeight: '1.45' }],
        'body-sm': ['0.75rem', { lineHeight: '1.25rem' }],
        caption: ['0.6875rem', { lineHeight: '1rem' }],
        display: ['1.6875rem', { lineHeight: '2rem', fontWeight: '600' }],
        'display-sm': ['1.3125rem', { lineHeight: '1.625rem', fontWeight: '600' }],
      },
      letterSpacing: {
        label: '0.08em',
      },
      borderRadius: {
        control: 'var(--radius-control)',
        card: 'var(--radius-card)',
        chip: 'var(--radius-chip)',
        pill: 'var(--radius-pill)',
        modal: 'var(--radius-modal)',
        xs: 'var(--radius-xs)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        'commit-bar': 'var(--shadow-commit-bar)',
      },
    },
  },
  plugins: [],
} satisfies Config;

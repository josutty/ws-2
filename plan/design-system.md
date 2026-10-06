# Design System — Demand Planning Workbench (Dealer, Phase 0)

Source: `analysis/design-tokens.md` (raw values from `inputs/ux/dealer.html`). Token definitions
live in `src/shared/ui/theme/tokens.css` (`:root` = light, `.dark` = dark); Tailwind exposes them
via `tailwind.config.ts`. Component agents: use only the class names below — never hex/rgb
literals, never `dark:` (tokens switch automatically on the `.dark` class set by `applyTheme()`).

## Tokens

| Token | Class(es) | Use it for | Don't use it for |
|---|---|---|---|
| `canvas` | `bg-canvas` | page/app background (`html`/`body`, outside cards) | card/panel backgrounds (use `surface`) |
| `surface` | `bg-surface` | card, panel, input, modal, drawer background | page background (use `canvas`) |
| `surface-muted` | `bg-surface-muted` | table header bg, disabled input bg, secondary panel bg | hover feedback (use `surface-hover`) |
| `surface-hover` | `bg-surface-hover` | IndentGrid row/sticky-column hover tint | persistent backgrounds |
| `topbar` / `topbar-fg` | `bg-topbar` / `text-topbar-fg` | TopBar only — dark on any theme, never switches with `.dark` | any other surface |
| `fg` | `text-fg` | primary text | secondary/caption text |
| `fg-muted` | `text-fg-muted` | secondary text (labels, helper text) | primary body copy |
| `fg-subtle` | `text-fg-subtle` | captions, meta text, small counters | anything needing >0.84rem size |
| `border` | `border-border` | default dividers, panel/card borders | form control borders (use `border-strong`) |
| `border-soft` | `border-border-soft` | soft row dividers (grid rows, list rows) | anything needing visible separation |
| `border-strong` | `border-border-strong` | form control borders (input/select/button), ≥3:1 | decorative dividers |
| `primary` / `primary-fg` | `bg-primary text-primary-fg` | primary button fill, links, active filter, focus-adjacent accents | success/info state (use `success`) |
| `primary-hover` | `hover:bg-primary-hover` | primary button hover fill | — |
| `primary-soft` | `bg-primary-soft text-primary` | active chip/tab bg, edit-band header, accent-tinted rows | plain card backgrounds |
| `success` / `success-fg` / `success-soft` | `text-success` / `bg-success text-success-fg` / `bg-success-soft` | positive status pill, "submitted", within-tolerance comparisons | warnings |
| `warning` / `warning-fg` / `warning-soft` | `text-warning` / `bg-warning text-warning-fg` / `bg-warning-soft` | "not submitted", missing-entry notices, aged-stock 60–90D | errors |
| `warning-strong` | `bg-warning-strong` | stock-aging bar's 90–180D segment only — a distinct step within the warning family, not text | text (non-text graphical use only, 3:1 checked) |
| `danger` / `danger-fg` / `danger-soft` | `text-danger` / `bg-danger text-danger-fg` / `bg-danger-soft` | errors, "not started", critical/aged->180D stock | warnings |
| `add` / `add-fg` / `add-soft` | `text-add` / `bg-add text-add-fg` / `bg-add-soft` | "added by dealer" tag/row-accent/Add-FERT button — new semantic token (design-tokens.md "Unmapped") | any other status |
| `focus` | `ring-focus` | focus ring (applied globally by base.css `:focus-visible`) | decorative rings |

## Type scale

| Class | Size / line-height | Weight | Use for |
|---|---|---|---|
| `text-heading-1` | 24px / 32px, tracking -0.025em | 600 | page title (`HomePage`/`WorkbookPage` h1) |
| `text-heading-2` | 19px / 24px | 600 | login card title |
| `text-heading-3` | 17px / 22px | 600 | modal title, drawer title |
| `text-display` | 27px / 32px, `font-mono` | 600 | big KPI numbers |
| `text-display-sm` | 21px / 26px, `font-mono` | 600 | secondary/small KPI numbers |
| `text-body` | 13.5px / 1.45 | 400 | default body/UI text (matches page base size) |
| `text-body-sm` | 12px / 20px | 400–600 | secondary labels, table cells |
| `text-caption` | 11px / 16px | 400 (pair with `font-bold uppercase tracking-label` for section/band/pill labels) | captions, meta counters |

`font-sans` (IBM Plex Sans, system fallback) is the default body font. `font-mono` (IBM Plex Mono,
tabular figures) is required on every quantity/numeric/code value — pair with `tabular-nums`.
Uppercase section/pill labels: `text-caption font-bold uppercase tracking-label` (`tracking-label`
= 0.08em, representative of the source's 0.05–0.11em range).

## Spacing rhythm

Tailwind's default spacing scale already covers most recurring gaps from design-tokens.md (2, 4,
6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 56px → `0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 14`). Use
the nearest default step; component agents should not invent new spacing tokens. The few
pixel-exact odd values in the source (e.g. card padding `16px 17px 15px`) don't need a bespoke
scale — use the nearest step (`p-4`) unless a TASK explicitly calls out pixel-perfect matching, in
which case an arbitrary value (`pt-4 pr-[17px] pb-[15px]`) is acceptable for that one recipe.
Page-level padding: `px-8 pt-5 pb-14` (32/20/56px). Card padding: `p-4` (16px, nearest default step).

## Radius / shadow

| Class | Value | Use for |
|---|---|---|
| `rounded-control` | 5px | buttons, inputs, selects, filter chip (base) |
| `rounded-card` | 8px | cards, grid-wrap |
| `rounded-chip` | 13px | filter token chip (`ftok`, pill-shaped) |
| `rounded-pill` | 16px | user chip (`tb-user`) |
| `rounded-modal` | 10px | modal box |
| `rounded-xs` | 3px | meter bar, seg-dots, addtag, quantity-cell input |
| `rounded-full` (Tailwind default) | 50% | avatar circle |
| `shadow-card` | source `--shadow` | default card elevation |
| `shadow-elevated` | source `--shadow-lg` | modal, drawer, FilterRail overlay (≤900px) |
| `shadow-commit-bar` | source commit-bar shadow | sticky CommitBar footer only (upward shadow) |

## Interactive state recipes (full static class strings — Tailwind content scan needs literals)

- **Primary button**: `bg-primary text-primary-fg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed rounded-control`
- **Ghost button**: `bg-surface text-fg-muted border border-border hover:bg-surface-muted hover:border-border-strong rounded-control`
- **Quiet button**: `bg-transparent text-fg-muted hover:bg-surface-muted rounded-control`
- **Add button**: `bg-surface text-add border border-add hover:bg-add-soft rounded-control`
- **Input default**: `bg-surface text-fg border border-border-strong rounded-control focus-visible:ring-2 focus-visible:ring-focus`
- **Input invalid**: `bg-surface text-fg border border-danger rounded-control focus-visible:ring-2 focus-visible:ring-danger` (paired with `aria-invalid` + visible error text, never color alone)
- **Input disabled**: `bg-surface-muted text-fg-muted border border-border cursor-not-allowed`
- **Link**: `text-primary hover:underline font-medium`
- **Card**: `bg-surface border border-border rounded-card shadow-card`
- **Skeleton**: `bg-surface-muted animate-pulse rounded-control` (respects `prefers-reduced-motion` via base.css)
- **Pill / Badge** (`tone` prop): `ok` → `bg-success-soft text-success`; `warn` → `bg-warning-soft text-warning`; `crit` → `bg-danger-soft text-danger`; `add` → `bg-add-soft text-add` — all: `rounded-xs px-2 py-0.5 text-caption font-bold uppercase tracking-label`
- **Active filter chip**: `bg-primary-soft text-primary border border-primary/40 rounded-chip`
- **Notice / banner** (error): `bg-danger-soft text-danger border border-danger/30 rounded-card` with `role="alert"`
- **Notice / banner** (warning, e.g. missing-entries): `bg-warning-soft text-warning border border-warning/30 rounded-card`
- **Row accent — no entry**: `shadow-[inset_3px_0_0_0_theme(colors.warning.DEFAULT)]` (or an equivalent left-border utility) paired with a visually-hidden text equivalent, never color-only
- **Row accent — added by dealer**: same pattern using `colors.add.DEFAULT`, plus the `addtag` recipe: `bg-add-soft text-add rounded-xs px-1.5 py-0.5 text-caption font-bold`
- **Stock-aging bar segments**: `<60D` → `bg-fg-subtle/30`; `60–90D` → `bg-warning-soft`; `90–180D` → `bg-warning-strong`; `>180D` → `bg-danger` (each segment carries a visually-hidden label, not just a tooltip)
- **Demand-mix bar segments**: Runner → `bg-success`; Repeater → `bg-warning`; Stranger → `bg-danger`

## Focus and reduced motion

Automatic from `base.css` — every focusable element gets `ring-2 ring-focus ring-offset-2
ring-offset-canvas` on `:focus-visible`; `prefers-reduced-motion: reduce` zeroes all transition/
animation durations globally. Components never need to apply focus/motion classes themselves
unless overriding the ring offset color on a non-canvas background (e.g. inside a `surface` card,
use `ring-offset-surface`).

## Dark mode

`applyTheme(mode)` (`src/shared/ui/theme/index.ts`) toggles the `dark` class on `<html>`; every
token above is redefined in `.dark` with the source HTML's explicit dark palette (not derived).
`topbar`/`topbar-fg` are the one pair that does NOT change between themes (source: dark-on-any-theme
top bar). No component should write its own `dark:` variant.

## Contrast table (`node tools/check-contrast.mjs` — light and dark, all pass)

All text pairs ≥ 4.5:1, all non-text pairs (`border-strong`, `focus`, `warning-strong` vs
`surface`) ≥ 3:1, in both `light` and `dark`. Representative results:

| Pair | Light | Dark |
|---|---|---|
| `fg` on `surface` | 16.16 | 14.01 |
| `fg-muted` on `surface` | 7.49 | 9.11 |
| `fg-subtle` on `surface` | 5.97 | 6.98 |
| `primary` on `surface` | 5.70 | 6.12 |
| `danger` on `surface` | 6.54 | 6.60 |
| `success` on `surface` | 5.35 | 7.18 |
| `warning` on `surface` | 5.89 | 7.41 |
| `add` on `surface` | 7.38 | 5.64 |
| `primary-fg` on `primary` | 5.70 | 6.44 |
| `warning` on `warning-soft` | 5.20 | 6.94 |
| `border-strong` on `surface` (nonText) | 7.49 | 9.11 |
| `focus` on `surface` (nonText) | 5.70 | 8.23 |
| `warning-strong` on `surface` (nonText) | 3.19 | 8.67 |

Full output: run `node tools/check-contrast.mjs` (22 pairs × 2 themes, exits 0).

## Adjustments made for contrast

- `warning` darkened from the source's raw `#A65D00` (166 93 0) to `150 84 0` — the raw value only
  reached 4.42:1 against `warning-soft`, just under the 4.5:1 text minimum. This also nudges
  `warning`-on-`surface` up to 5.89:1 (was 5.02:1); no other pair regressed.
- `fg-subtle` set to `88 101 113` rather than the raw `--muted` (`107 124 138`, source `#6B7C8A`) —
  the raw value was too close to the 4.5:1 floor for an 11px caption; darkened to keep margin.
- `primary-fg`/`success-fg`/`warning-fg`/`danger-fg`/`add-fg` are white in light mode but flip to a
  near-black (`23 23 23`) in dark mode. The source HTML hardcodes `color:#fff` on filled buttons/
  pills regardless of theme, but the dark-mode intent colors (e.g. `--accent` dark `#4FA3D6`) are
  much lighter than their light-mode counterparts — white text on them would fail 4.5:1. Flipping
  the `-fg` token per-theme keeps the same class names (`bg-primary text-primary-fg`) working
  correctly in both themes without a component-level `dark:` override.
- `warning-strong` (90–180D stock-aging segment, source hardcoded `#D97706`, not a CSS variable in
  the HTML) was given its own token rather than collapsing onto `warning`, since the source visibly
  distinguishes the 60–90D and 90–180D bar segments. Confirms the `plan/tasks/TASK-010.md` note:
  "collapsing it onto the warning token family" — implemented as a family member (`warning-strong`),
  not a wholesale reuse of the plain `warning` value, so the two adjacent bar segments stay visually
  distinct.

## New tokens beyond the AGENTS.md §4 base contract

`canvas`, `surface-hover`, `topbar`/`topbar-fg`, `fg-subtle`, `border-soft`, `primary-hover`,
`primary-soft`, `*-soft` backgrounds for every intent, `warning-strong`, and the full `add` family
were added because the source design needs them (AGENTS.md §4/§11: "Add tokens when the design
needs them; never rename or remove one"). None of the base contract's token names were renamed or
removed.

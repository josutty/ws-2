---
id: TASK-001
status: open
revision: 2
depends-on: []
created: 2026-10-01
---

# TASK-001: shared/ui — Button, Input, Select, Badge, Modal, Toast

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/shared/ui/Button.tsx | presentational | component-generator | new |
| src/shared/ui/Input.tsx | presentational | component-generator | new |
| src/shared/ui/Select.tsx | presentational | component-generator | new |
| src/shared/ui/Badge.tsx | presentational | component-generator | new |
| src/shared/ui/Modal.tsx | presentational | component-generator | new |
| src/shared/ui/Toast.tsx | presentational | component-generator | new |
| src/shared/ui/index.ts | public api | component-generator | new |
| src/shared/ui/Button.stories.tsx | story | component-generator | new |
| src/shared/ui/Input.stories.tsx | story | component-generator | new |
| src/shared/ui/Select.stories.tsx | story | component-generator | new |
| src/shared/ui/Badge.stories.tsx | story | component-generator | new |
| src/shared/ui/Modal.stories.tsx | story | component-generator | new |
| src/shared/ui/Toast.stories.tsx | story | component-generator | new |
| src/shared/ui/Button.test.tsx | test | test-engineer | new |
| src/shared/ui/Input.test.tsx | test | test-engineer | new |
| src/shared/ui/Select.test.tsx | test | test-engineer | new |
| src/shared/ui/Badge.test.tsx | test | test-engineer | new |
| src/shared/ui/Modal.test.tsx | test | test-engineer | new |
| src/shared/ui/Toast.test.tsx | test | test-engineer | new |
| test/setup.ts | test harness | test-engineer | new |
| test/test-utils.tsx | test harness | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: none — all six are pure presentational primitives, no store/query hooks.
- Client state: none.
- Mutations: none.
- Errors: n/a (consumers render error text as children/props; these primitives don't fetch).
- No fetch/axios/useState for server data (AGENTS.md §3) — trivially satisfied, no data layer here.

## Components

### Button (presentational)
- Props: `variant: 'primary' | 'ghost' | 'quiet' | 'add'; size?: 'default' | 'sm'; disabled?: boolean; type?: 'button' | 'submit'; onClick?: () => void; children: ReactNode`
  (matches analysis/components.md → Button primitive)
- A11y: renders a real `<button>`; `disabled` uses the native attribute (not opacity-only); visible
  focus ring from theme tokens (styling-engineer, not this TASK).
- Responsive: fixed control height per design-tokens.md (32px default / 27px `sm`), no layout shift.

### Input (presentational)
- Props: `id: string; label: string; type?: 'text' | 'number' | 'password' | 'search'; value: string; onChange: (value: string) => void; error?: string; disabled?: boolean; autoComplete?: string; min?: number`
  (native `<input>` per components.md primitives list)
- A11y: visible `<label htmlFor>`; `error` sets `aria-invalid` + `aria-describedby` pointing at an
  `id`-derived error `<span>` (fixes the LoginForm/filter-search gap noted in components.md).

### Select (presentational)
- Props: `id: string; label: string; options: Array<{ value: string; label: string }>; value: string; onChange: (value: string) => void; disabled?: boolean`
  (native `<select>` per components.md — used for vertical selector, saved-views dropdown)
- A11y: visible `<label htmlFor>`.

### Badge / pill (presentational)
- Props: `tone: 'ok' | 'warn' | 'crit' | 'add'; children: ReactNode`
  (matches `.pill` — `p-ok`/`p-warn`/`p-crit`/`p-add`)
- A11y: tone is always paired with visible text by callers — this component renders only text +
  tone-mapped classes, never a color-only indicator itself.

### Modal / dialog shell (presentational)
- Props: `open: boolean; title: string; subtitle?: string; onClose: () => void; children: ReactNode; footer?: ReactNode`
- A11y: renders `role="dialog"` `aria-modal="true"` `aria-labelledby` (pointing at the title);
  traps focus while open and returns focus to the trigger element on close; `Escape` calls
  `onClose` (fixes the components.md gap: source HTML had no focus trap/`role="dialog"`).
- Consumers (AddFertModal, ExportModal, ReviewSubmitModal) reuse this shell — no backdrop/scrim
  logic duplicated per consumer.

### Toast (presentational)
- Props: `message: string | null`
- A11y: renders `role="status"` `aria-live="polite"` wrapper so screen readers announce it (fixes
  the components.md gap — source HTML had no `aria-live`); auto-dismiss timing is owned by the
  app-level toast host (app-bootstrap, not this component) — Toast itself is stateless display.

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| default | Button | enabled, variant-styled |
| disabled | Button | `disabled` attribute set, `cursor:not-allowed` |
| default/error | Input | label + value; error → invalid styling + error text |
| closed | Modal | not rendered (or `display:none`, no focus trap active) |
| open | Modal | dialog visible, focus moved inside, Escape closes |
| hidden | Toast | `message === null` → not rendered |
| shown | Toast | `message` set → visible, announced via `aria-live` |

## Tests (test-engineer writes RED first)
- Button.test.tsx: renders children; calls `onClick` on click; `disabled` prevents `onClick`;
  each `variant` renders without crashing.
- Input.test.tsx: label associates with input (`getByLabelText`); typing calls `onChange`;
  `error` sets `aria-invalid` + visible error text tied by `aria-describedby`.
- Select.test.tsx: label associates with select; choosing an option calls `onChange`.
- Badge.test.tsx: renders children for each `tone`.
- Modal.test.tsx: `open=false` renders nothing; `open=true` renders dialog with `aria-modal`;
  Escape calls `onClose`; focus moves into the dialog on open and returns to the trigger on close.
- Toast.test.tsx: `message=null` renders nothing; `message` set renders text inside a
  `role="status"` element.
- Coverage target: 70% (shared is not features/widgets).

## Styling
Semantic tokens only (bg-surface, text-fg, bg-primary, text-primary-fg, border-border,
bg-danger/text-danger for Input error state, tone→token mapping for Badge). No `dark:` — tokens
switch automatically. Token names live in `plan/design-system.md` (styling-engineer, Phase 3a) —
this TASK's components reference token class names but do not define the tokens themselves.

## Teardown
- Modal: removes its own keydown (`Escape`) listener and returns focus on unmount/close. No other
  manual resources.
- None for Button, Input, Select, Badge, Toast.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/shared/ui && npm run build-storybook
```

## Reflections applied
- none (no entries under notes/memory/reflections/)
- revision 2: added test/setup.ts and test/test-utils.tsx to Files table — the shared test harness
  is created incidentally by the first TASK in the run (no harness existed yet) and was not
  previously planned (reviewer FAIL-MECH scope-check fix, no other content changed).

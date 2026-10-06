---
id: TASK-003
status: open
revision: 1
depends-on: [TASK-001]
created: 2026-10-01
---

# TASK-003: features/edit-indent-line — EditableQtyCell

> **Open item (G1, not blocking):** `EditableQtyCell` has no standalone `### EditableQtyCell` entry
> in `analysis/components.md` — it is only named in `IndentGrid`'s "Reuses: Button,
> EditableQtyCell" line, and `component-owners.md` itself says "inferred ... not separately
> cataloged in components.md". Per architect dispatch, this TASK's props/behavior/states are
> reconstructed directly from IndentGrid's own spec (components.md → IndentGrid: props
> `onEditCell(rowId, weekIndex, value)`, arrow-key nav, Ctrl/Cmd+D fill-down, spreadsheet paste,
> `disabled` once submitted) and from `ui-states.md`'s IndentGrid states (`cell-carry-forward-hint`,
> `row-added`, `multi-cell paste`, `success-editable`/`success-locked`) — **not from a standalone
> component entry**. If wireframe-analyzer later adds a real `### EditableQtyCell` entry
> (coverage-matrix.md's suggested route for G1), re-run this TASK at a bumped revision against it.

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/features/edit-indent-line/ui/EditableQtyCell.tsx | presentational | component-generator | new |
| src/features/edit-indent-line/index.ts | public api | component-generator | new |
| src/features/edit-indent-line/ui/EditableQtyCell.stories.tsx | story | component-generator | new |
| src/features/edit-indent-line/ui/EditableQtyCell.test.tsx | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: none directly — `EditableQtyCell` is presentational; the owning `IndentGrid`
  (TASK-014) wires it to `updateDealerIndentCell` / `batchUpdateDealerIndentCells`.
- Client state: none — value/disabled/priorValue are props; arrow-key navigation and fill-down are
  orchestrated by the parent grid (D21/D23-equivalent local state lives in `widgets/indent-grid`,
  not here), this component only exposes the raw DOM events the parent needs (`onKeyDown`,
  `onPaste`) so the grid can implement cross-cell navigation/fill/paste without this component
  reimplementing grid-wide logic.
- Mutations: none directly (parent's responsibility).
- Errors: none directly — optimistic-update revert + toast-on-409 (per
  `plan/api-integration-points.md`'s `updateDealerIndentCell`/`batchUpdateDealerIndentCells` rows)
  are the parent grid's responsibility.
- No fetch/axios/useState for server data (AGENTS.md §3) — trivially satisfied, no data layer here.

## Components

### EditableQtyCell (presentational)
- Props (reconstructed — see note above): `value: number; priorValue?: number; disabled?: boolean;
  onChange: (value: number) => void; onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: ClipboardEvent<HTMLInputElement>) => void; 'aria-label': string`
  - `priorValue` drives the "was `{n}`" carry-forward hint (only rendered when `priorValue` is
    defined and non-zero, per ui-states.md's `cell-carry-forward-hint`).
  - `disabled` reflects the grid's `success-locked` state (vertical submitted) — renders the
    native `disabled` attribute, not opacity-only.
  - `onKeyDown`/`onPaste` are forwarded raw so the parent `IndentGrid` can implement arrow-key
    navigation, Ctrl/Cmd+D fill-down, and multi-cell spreadsheet paste across a rectangle of
    cells — those are grid-wide concerns, not this cell's.
- Shows: a real `<input type="number" min="0">` (reuses shared `Input`'s number-mode styling) plus
  an optional small "was `{n}`" caption beneath it.
- A11y: `aria-label` is required (not optional) on this component's public contract — the grid
  must supply one identifying the FERT + period (e.g. `"July week 1 quantity for FERT-1042"`) since
  there's no visible per-cell label in the grid layout; this fixes the components.md-noted gap
  where quantity inputs had no accessible name of their own.
- Responsive: fixed cell width/height per design-tokens.md grid row heights (40px comfortable /
  31px compact) — density is a prop the grid controls via its own CSS class, not a prop of this
  component.

## UI states (from analysis/ui-states.md, traced via IndentGrid)
| State | Rendered by | Expected UI |
|---|---|---|
| editable | EditableQtyCell | input enabled, focusable |
| locked | EditableQtyCell | `disabled=true`, muted background (grid's `success-locked`) |
| carry-forward hint | EditableQtyCell | "was `{n}`" caption when `priorValue` is set and non-zero |
| no hint | EditableQtyCell | caption omitted when `priorValue` is 0/undefined |

## Tests (test-engineer writes RED first)
- EditableQtyCell.test.tsx: renders `value`; typing a new number calls `onChange` with the parsed
  number; `disabled` renders a disabled input and blocks typing; `priorValue` set → "was `{n}`"
  caption renders; `priorValue` omitted/0 → no caption; `aria-label` is applied to the input;
  `onKeyDown`/`onPaste` handlers fire when supplied (fired via `fireEvent`, not asserting grid-wide
  behavior which belongs to IndentGrid's own tests).
- Coverage target: 80% (features).

## Styling
Semantic tokens only. No `dark:`.

## Teardown
- None.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/features/edit-indent-line && npm run build-storybook
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

---
id: TASK-014
status: open
revision: 1
depends-on: [TASK-001, TASK-003]
created: 2026-10-01
---

# TASK-014: widgets/indent-grid — IndentGrid, LineDetailDrawer

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/widgets/indent-grid/ui/IndentGrid.tsx | connected | coder | new |
| src/widgets/indent-grid/ui/LineDetailDrawer.tsx | connected | coder | new |
| src/widgets/indent-grid/index.ts | public api | coder | new |
| src/widgets/indent-grid/ui/IndentGrid.test.tsx | test | test-engineer | new |
| src/widgets/indent-grid/ui/LineDetailDrawer.test.tsx | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: `useListDealerIndentLinesQuery({ vertical, search, sort, ... })`
  (`entities/indent-line`).
- Client state: sort column/direction (D21), selected line + drawer open (D23), column-band mode
  and density (D22, shared with `widgets/workbook-toolbar` via lifted props from the composing
  page) are this widget's own local state — no slice.
- Mutations: `features/edit-indent-line`'s `useUpdateDealerIndentCellMutation` (single-cell,
  optimistic update) and `useBatchUpdateDealerIndentCellsMutation` (multi-cell paste) — both
  invalidate `IndentLine` per api-integration-points.md.
- Errors: `listDealerIndentLines` failure → banner + retry replacing the grid; empty (active
  filters match 0 lines) → "No lines match these filters" panel + "Clear all filters" button;
  `updateDealerIndentCell` failure → revert the optimistic value + inline toast, 409
  (`updateIndentCellConflict` scenario, line locked/submitted) → toast + cell re-disabled;
  `batchUpdateDealerIndentCells` 207 partial failure (`batchUpdateCellsPartialReject` scenario) →
  toast "`{n}` of `{total}` cells pasted, `{n}` failed"; full failure → toast + no cells change.
- No fetch/axios/useState for server data (AGENTS.md §3) — optimistic cell values use RTK Query's
  own optimistic-update mechanism (`onQueryStarted`/`updateQueryData`), not local `useState` copies.

## Components

### IndentGrid (connected)
- Props: `vertical: 'lmd' | 'hd'; query: string; sort: { key: string; dir: 1 | -1 } | null;
  onSort: (key: string) => void; submitted: boolean; density: 'comfortable' | 'compact';
  bandMode: Record<string, 'off' | 'summary' | 'full'>; onOpenDetail: (lineId: string) => void`
  (filter tokens/facets come from `features/filter-indent`, lifted by the composing page, not a
  prop of this component directly — the page passes the resolved query params into the hook call)
- Shows: dense two-row header (band-group + sortable leaf row), sticky first column + header;
  reference bands (Vehicle attributes, Current dealer stock, Opening & live POs, Pipeline,
  Trend-offtake, Trend-retail, Last cycle) per `bandMode`; editable "Your indent" band (W1–W4, Jul
  calculated, Aug, Sep, Total calculated) using `EditableQtyCell` (TASK-003) per cell; "was `{n}`"
  carry-forward hint; filtered/visible total row; empty state.
- Interactions: arrow-key navigation between `EditableQtyCell`s (via each cell's forwarded
  `onKeyDown`), Ctrl/Cmd+D fill-down, tab/newline-delimited spreadsheet paste across a rectangle
  (via each cell's forwarded `onPaste`, triggers `batchUpdateDealerIndentCells`); band header click
  cycles `bandMode`; "ⓘ" button opens `LineDetailDrawer`; `noentry`/`isadd` rows get a left-edge
  accent bar **plus** a visually-hidden text equivalent ("No entry yet" / "Added by you") on the row
  (fixes the components.md-noted color-only gap).
- Responsive: `min-width` + horizontal scroll (not mobile-optimized by design, per FSD §6.1 — a
  dense planning grid, confirmed out of the mobile-first requirement's scope for this one widget).

### LineDetailDrawer (connected)
- Props: `lineId: string | null; onClose: () => void` (`line` data sourced from the same
  `useListDealerIndentLinesQuery` cache by id, not re-fetched)
- Shows: slide-over for one FERT line — vehicle attributes (dealer segment vs Eicher segment, with
  a "differs" flag), stock-by-age + opening stock + live POs (+ SAP source line), offtake/retail
  trend L3/L6/L12/LYSM (+ source line), last-cycle comparison (planned/entered/difference + weekly
  carry-forward breakdown).
- A11y: `aria-label="Line detail"` on the `<aside>` (already in source); close button gets
  `aria-label="Close line detail"` (fixes the components.md-noted gap — source was icon-only "×"
  with no label); closes via close button, scrim, or Escape; focus returns to the triggering "ⓘ"
  button on close.

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| loading | IndentGrid | skeleton |
| error | IndentGrid | banner + retry (`indentLinesServerError`/`indentLinesNetworkError` scenarios) |
| empty | IndentGrid | "No lines match these filters" + "Clear all filters" |
| success-editable | IndentGrid | cells enabled (`submitted=false`) |
| success-locked | IndentGrid | cells disabled (`submitted=true`) |
| row-no-entry | IndentGrid | amber accent + visually-hidden "No entry yet" |
| row-added | IndentGrid | purple accent + "ADDED" tag + visually-hidden "Added by you" |
| cell-carry-forward-hint | IndentGrid | "was `{n}`" caption (via `EditableQtyCell`'s `priorValue`) |
| sorted | IndentGrid | sort arrow, asc/desc/cleared on repeat clicks |
| band-collapsed/expanded | IndentGrid | column(s) shown per `bandMode` |
| multi-cell paste | IndentGrid | `batchUpdateDealerIndentCells` call, toast confirms count |
| cell-conflict (409) | IndentGrid | optimistic value reverts, toast, cell re-disabled |
| closed | LineDetailDrawer | `lineId=null`, drawer + scrim hidden |
| open | LineDetailDrawer | slide-over + scrim shown, focus moved in |
| segment-mismatch | LineDetailDrawer | amber "differs" label |
| aged-stock-present | LineDetailDrawer | amber/red value color + paired label text |

## Tests (test-engineer writes RED first)
- IndentGrid.test.tsx: renders rows from `listDealerIndentLines`; `indentLinesEmpty` → empty
  panel; `indentLinesServerError` → banner + retry; `submitted=true` disables all cells; editing a
  cell calls `updateDealerIndentCell` with an optimistic update, `updateIndentCellConflict` →
  value reverts + toast + cell disabled; pasting a rectangle of values calls
  `batchUpdateDealerIndentCells`, `batchUpdateCellsPartialReject` → toast reports partial success;
  clicking a column header toggles sort asc → desc → cleared; clicking "ⓘ" calls `onOpenDetail`;
  no-entry/added rows carry a visually-hidden text equivalent, not color-only.
- LineDetailDrawer.test.tsx: `lineId=null` renders nothing; `lineId` set renders the line's detail
  sections; close button has `aria-label`; Escape and scrim click both call `onClose`; segment
  mismatch renders the "differs" label; aged stock >180D renders the red value + label.
- Coverage target: 80% (widgets).

## Styling
Semantic tokens only — accent bars/tags use `warning`/`add`(new semantic token, per design-tokens.md's
"Unmapped" section — confirm exact name with styling-engineer in `plan/design-system.md`). No
`dark:` beyond what the tokens already carry.

## Teardown
- IndentGrid: removes its own document-level keydown (arrow-nav/fill-down) and paste listeners on
  unmount.
- LineDetailDrawer: removes its own Escape listener and returns focus to the triggering button on
  close/unmount.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/widgets/indent-grid
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

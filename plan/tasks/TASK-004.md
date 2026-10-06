---
id: TASK-004
status: open
revision: 1
depends-on: [TASK-001]
created: 2026-10-01
---

# TASK-004: features/filter-indent — FilterRail, MultiSelectFilter

> **Open item (G2, resolved per architect dispatch — excluded, not TBD):** D20 "saved filter
> views" is classified `TBD` in `analysis/dataflow.md` (server vs session-only persistence
> unconfirmed, no endpoint proposed per `backend-gaps.md`). Per dispatch instructions this TASK
> does **not** plan saved-view persistence as committed behavior: `FilterRail` ships with the
> `no-saved-views` state only (saved-views dropdown never renders because no view can ever be
> saved in this build); `savedViews`, `onSaveView`, `onApplyView` are **not** part of this TASK's
> prop contract. The "Save view" footer button is omitted entirely rather than wired to a fake
> local-only persistence, since that would silently commit to the "session-only" answer to Q3
> without a human decision. Revisit (new revision) once G2/Q3 is resolved.

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/features/filter-indent/ui/FilterRail.tsx | connected | coder | new |
| src/features/filter-indent/ui/MultiSelectFilter.tsx | presentational | component-generator | new |
| src/features/filter-indent/index.ts | public api | coder | new |
| src/features/filter-indent/ui/MultiSelectFilter.stories.tsx | story | component-generator | new |
| src/features/filter-indent/ui/FilterRail.test.tsx | test | test-engineer | new |
| src/features/filter-indent/ui/MultiSelectFilter.test.tsx | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: `useListDealerIndentLinesQuery` (`entities/indent-line`) — read-only, for computing
  facet option counts (each `MultiSelectFilter` option's `count`). No dedicated facet endpoint
  exists; counts are derived client-side over the already-loaded line list.
- Client state: none — `Record<FilterKey, Set<string>>` is `FilterRail`'s own component state
  (D18, local UI state per AGENTS.md/api-integration-points.md — no slice), lifted only to its
  siblings (`widgets/workbook-toolbar` for token chips, `widgets/indent-grid`/`widgets/rollup` for
  filtering rows) via props/callbacks passed down from the composing widget/page, not via a store.
- Mutations: none.
- Errors: facet counts derive from `listDealerIndentLines`; if that query errors, `FilterRail`
  still renders with all filters showing 0/disabled options rather than crashing (the owning
  `widgets/indent-grid`/page shows the primary banner+retry for that query — not duplicated here).
- No fetch/axios/useState for server data (AGENTS.md §3) — facet counts read from the RTK Query
  hook's `data`, not copied into local state.

## Components

### FilterRail (connected)
- Props: `filters: Record<FilterKey, Set<string>>; collapsed: boolean; onToggleCollapsed: () => void;
  onChangeFilter: (key: FilterKey, values: Set<string>) => void; onClear: () => void`
  (matches components.md's `FilterRail`, minus `savedViews`/`onSaveView`/`onApplyView` per the G2
  note above)
- Shows: collapsible sidebar; header with filter-count badge + collapse toggle; one
  `MultiSelectFilter` per `FilterKey` (Vertical, FERT, Sub-vertical, Demand segment, MPG model,
  Tonnage, Fuel, Cabin, FERT History, Status); footer with "Clear all" only (no "Save view" —
  see G2 note). Collapsed state shows a narrow stub with count + rotated "Filters" label.
- A11y: collapse toggle has `aria-label="Collapse filters"`/`"Expand filters"` (fixes the
  components.md-noted gap) and `aria-expanded` reflecting `collapsed`.
- Responsive: becomes an absolutely-positioned overlay at ≤900px per design-tokens.md breakpoints
  (implemented in Tailwind via a `md:` variant, not the raw `900px` value verbatim).

### MultiSelectFilter (presentational)
- Props: `label: string; options: Array<{ value: string; label: string; sublabel?: string; count: number }>;
  selected: Set<string>; onToggle: (value: string) => void; onSearch: (term: string) => void;
  query: string; onClear: () => void`
- Shows: label + "clear" link (active only), a button showing "All" / the one selected value's
  label / "`{n}` selected", and (when open) a popover with search box, scrollable option list
  (options at 0 count are omitted unless already selected), footer "Clear + `{n}` of `{total}`".
- A11y: popover option buttons are real `<button>`s; popover itself gets `role="listbox"` and each
  option `role="option"` `aria-selected` (fixes the components.md-noted gap — source had neither).
- FERT variant's search box accepts paste-many-codes (`onPaste` handler, comma/newline-delimited)
  per components.md — implemented here as an optional `onPasteCodes?: (codes: string[]) => void`
  prop, only wired by `FilterRail` for the FERT filter instance.

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| expanded | FilterRail | full filter list, footer with Clear all only (no Save view — G2) |
| collapsed | FilterRail | narrow stub, count badge + vertical label |
| filters-active | FilterRail | count badge visible on both expanded/collapsed views |
| no-saved-views | FilterRail | saved-views affordance never rendered (permanent for this build — G2) |
| closed | MultiSelectFilter | button shows "All" (dim) or current selection summary |
| open | MultiSelectFilter | popover with search + option list open |
| option-disabled | MultiSelectFilter | 0-count option omitted from the list (unless already selected) |
| no-match | MultiSelectFilter | "No match" empty state in the popover |

## Tests (test-engineer writes RED first)
- FilterRail.test.tsx: renders one `MultiSelectFilter` per filter key; collapse toggle flips
  `aria-expanded` and calls `onToggleCollapsed`; "Clear all" calls `onClear`; no "Save view"
  button/saved-views select is ever rendered (regression test for the G2 exclusion).
- MultiSelectFilter.test.tsx: closed shows "All" when `selected` is empty; opens popover on click;
  toggling an option calls `onToggle`; 0-count option is hidden unless selected; search with no
  match shows "No match"; typing in search calls `onSearch`.
- Coverage target: 80% (features).

## Styling
Semantic tokens only. No `dark:` beyond the `md:` responsive overlay variant already covered by
breakpoints, not color.

## Teardown
- MultiSelectFilter: removes its own outside-click listener on close/unmount. No other manual
  resources.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/features/filter-indent && npm run build-storybook
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

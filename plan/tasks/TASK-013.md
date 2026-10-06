---
id: TASK-013
status: open
revision: 1
depends-on: [TASK-001, TASK-004, TASK-005, TASK-006]
created: 2026-10-01
---

# TASK-013: widgets/workbook-toolbar — WorkbookToolbar, ColumnsPopover

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/widgets/workbook-toolbar/ui/WorkbookToolbar.tsx | connected | coder | new |
| src/widgets/workbook-toolbar/ui/ColumnsPopover.tsx | presentational | component-generator | new |
| src/widgets/workbook-toolbar/index.ts | public api | coder | new |
| src/widgets/workbook-toolbar/ui/ColumnsPopover.stories.tsx | story | component-generator | new |
| src/widgets/workbook-toolbar/ui/WorkbookToolbar.test.tsx | test | test-engineer | new |
| src/widgets/workbook-toolbar/ui/ColumnsPopover.test.tsx | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: `useListDealerIndentLinesQuery` (`entities/indent-line`) — for result/total counts
  only (`resultCount`/`totalCount` props are derived here, not passed in from the page).
- Client state: `query` (search, D19), `density`/column-band open state (D22) are local component
  state; active filter tokens come from `features/filter-indent`'s `FilterRail` state, lifted by
  the composing page and passed down as `tokens`/`onRemoveToken` props (no slice).
- Mutations: none directly — "Add FERT" and "Export" open `AddFertModal`/`ExportModal`
  (`features/add-fert-line`, `features/export-indent`) via open-state props owned by the composing
  widget/page (D24), not owned here.
- Errors: n/a — this widget has no server error of its own beyond the shared `listDealerIndentLines`
  state already surfaced by `widgets/indent-grid`.
- No fetch/axios/useState for server data (AGENTS.md §3).

## Components

### WorkbookToolbar (connected)
- Props: `vertical: 'lmd' | 'hd'; onVerticalChange: (v: 'lmd' | 'hd') => void; query: string;
  onQueryChange: (q: string) => void; tokens: FilterToken[]; onRemoveToken: (token: FilterToken) => void;
  onAddFert: () => void; onExport: () => void; density: 'comfortable' | 'compact';
  onDensityChange: (d: 'comfortable' | 'compact') => void`
  (`resultCount`/`totalCount` come from the query hook internally, not props)
- Shows: vertical selector (shared `Select`), search box (shared `Input`), removable filter-token
  chips + trailing "Clear all" (when `tokens.length > 0`), results count, "+ Add FERT" button,
  "Export" button, density toggle, "☷ Columns" button opening `ColumnsPopover`.
- Responsive: horizontally scrollable strip (`overflow-x-auto`), not wrapping — matches source UX.

### ColumnsPopover (presentational)
- Props: `presets: string[]; activePreset: string | null; bands: Array<{ key: string; label: string;
  colCount: number; mode: 'off' | 'summary' | 'full'; hasSummary: boolean }>; onSetPreset: (preset: string) => void;
  onSetBandMode: (key: string, mode: 'off' | 'summary' | 'full') => void; onClose: () => void`
- Shows: preset chips (Essentials, Stock focus, Trends, Everything); per-band Hide/Summary/Full
  segmented control (Summary control omitted where `hasSummary=false`) + column count.
- A11y: closes on outside click and Escape; segmented controls are real radio-group-equivalent
  button groups with `aria-pressed`.

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| no-filters | WorkbookToolbar | no token chips, just search/add/export/density/columns |
| filters-active | WorkbookToolbar | token chips + trailing "Clear all" |
| closed | ColumnsPopover | hidden |
| open | ColumnsPopover | presets + per-band controls shown |

## Tests (test-engineer writes RED first)
- WorkbookToolbar.test.tsx: vertical select calls `onVerticalChange`; typing in search calls
  `onQueryChange`; renders a chip per token, removing one calls `onRemoveToken`; `tokens=[]` hides
  "Clear all"; "+ Add FERT"/"Export" call their callbacks; density toggle calls `onDensityChange`;
  results count reflects `useListDealerIndentLinesQuery`'s `totalElements`.
- ColumnsPopover.test.tsx: renders preset chips and band rows; clicking a preset calls
  `onSetPreset`; clicking a band's Full control calls `onSetBandMode(key, 'full')`; bands with
  `hasSummary=false` omit the Summary control; outside click / Escape calls `onClose`.
- Coverage target: 80% (widgets).

## Styling
Semantic tokens only. No `dark:`.

## Teardown
- ColumnsPopover: removes its own outside-click/Escape listeners on close/unmount.
- WorkbookToolbar: none beyond that.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/widgets/workbook-toolbar && npm run build-storybook
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

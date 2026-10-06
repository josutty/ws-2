---
id: TASK-012
status: open
revision: 1
depends-on: [TASK-001]
created: 2026-10-01
---

# TASK-012: widgets/rollup — RollupTable

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/widgets/rollup/ui/RollupTable.tsx | connected | coder | new |
| src/widgets/rollup/index.ts | public api | coder | new |
| src/widgets/rollup/ui/RollupTable.test.tsx | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: `useListDealerIndentLinesQuery` (`entities/indent-line`) — rollup rows are a
  client-side group-by aggregation over this already-loaded list (no dedicated rollup endpoint).
- Client state: `groupBy`, expanded-row `Set`, per-band `bandMode` map are this component's own
  local state (D27, no slice per AGENTS.md/api-integration-points.md).
- Mutations: none.
- Errors: banner + retry (standard, shares the `listDealerIndentLines` error state with
  `widgets/indent-grid`/`widgets/plan-performance`).
- No fetch/axios/useState for server data (AGENTS.md §3).

## Components

### RollupTable (connected)
- Props: none (fully self-contained — reads the line list via the hook, all grouping/band state is
  local)
- Shows: "Group by" segmented control (Vertical, Sub-vertical, MPG, Tonnage, AC/Non-AC, Segment,
  FERT); a note honoring the Workbook's active filters (Vertical grouping always shows both
  verticals — matches source UX exactly); banded table (fixed "Your indent" block always visible,
  plus collapsible Demand mix / Current dealer stock / Trend-offtake / Trend-retail / Last cycle
  bands, each off/summary/full); expandable group rows; Total row.
- A11y: real `<table>`; expand/collapse buttons flip their `aria-label` between "Expand `{group}`"
  and "Collapse `{group}`" based on state (fixes the components.md-noted gap — source always said
  "Expand").

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| loading | RollupTable | skeleton |
| error | RollupTable | banner + retry (`indentLinesServerError` scenario) |
| default-grouping | RollupTable | grouped by Sub-vertical, bands at default mode |
| row-expanded | RollupTable | child FERT rows shown, indented |
| band summary/full/off | RollupTable | column(s) for that band show 1 col / all cols / none |

## Tests (test-engineer writes RED first)
- RollupTable.test.tsx: default grouping is Sub-vertical; switching `groupBy` re-groups rows;
  expanding a group row reveals its child FERT rows and flips the expand button's `aria-label` to
  "Collapse …"; clicking a band header cycles summary→full→(off, where applicable); Total row sums
  match the fixture data; `indentLinesServerError` → banner + retry; `indentLinesEmpty` → standard
  empty treatment.
- Coverage target: 80% (widgets).

## Styling
Semantic tokens only. No `dark:`.

## Teardown
- None — RTK Query hook unsubscribes automatically.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/widgets/rollup
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

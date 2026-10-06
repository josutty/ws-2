---
id: TASK-011
status: open
revision: 1
depends-on: [TASK-001]
created: 2026-10-01
---

# TASK-011: widgets/accuracy-summary — IndentAccuracyCard, AccuracyReportPanel

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/widgets/accuracy-summary/ui/IndentAccuracyCard.tsx | connected | coder | new |
| src/widgets/accuracy-summary/ui/AccuracyReportPanel.tsx | connected | coder | new |
| src/widgets/accuracy-summary/index.ts | public api | coder | new |
| src/widgets/accuracy-summary/ui/IndentAccuracyCard.test.tsx | test | test-engineer | new |
| src/widgets/accuracy-summary/ui/AccuracyReportPanel.test.tsx | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: `useGetDealerAccuracyHistoryQuery({ groupBy })` (`entities/accuracy`) — `groupBy`
  is a required query param (`"outlet" | "fert"`), switched by `AccuracyReportPanel`'s view toggle;
  `useListDealerOutletsQuery` (`entities/dealer`) for outlet names in the "by outlet" view.
- Client state: `view: 'outlet' | 'fert'` and the collapsed/expanded toggle are local component
  state on `IndentAccuracyCard`/`AccuracyReportPanel` (no slice).
- Mutations: none.
- Errors: banner + retry within the card (per api-integration-points.md); empty history is "n/a
  for Phase 0" per FSD assumption (dealer always has ≥4 cycles) — still implement the empty state
  for defensiveness, just don't treat it as a primary scenario to demo.
- No fetch/axios/useState for server data (AGENTS.md §3).

## Components

### IndentAccuracyCard (connected)
- Props: `tolerancePct: number` (fixed business constant, e.g. 10, passed by the composing page —
  not fetched)
- Shows: 4-cycle average accuracy %, bias % with label, sparkline (one bar per month), summary
  pill, caption, "▸ View report card" toggle.
- A11y: sparkline bars get a visually-hidden text equivalent (month/pct/indented/offtake) next to
  the `title` tooltip (fixes the components.md-noted gap).

### AccuracyReportPanel (connected)
- Props: `onSelectFert?: (fertCode: string) => void`
- Shows: "By outlet" / "By vehicle" toggle; table (one row per outlet, or top 25 FERTs in the
  current filter) with per-month indent/offtake, accuracy % + mini bar, bias pill. "By vehicle"
  rows are clickable → `onSelectFert`.
- A11y: real `<table>` with `<th>`; clickable rows get `role="button"` `tabIndex={0}` and an Enter/
  Space key handler (fixes the components.md-noted gap — source had `cursor:pointer` only).

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| loading | both | skeleton |
| error | both | banner + retry (`accuracyHistoryServerError` scenario) |
| collapsed | IndentAccuracyCard | "▸ View report card" button, panel hidden |
| expanded-by-outlet | AccuracyReportPanel | table of outlets + total row |
| expanded-by-vehicle | AccuracyReportPanel | top 25 FERTs, clickable rows |
| empty-by-vehicle | AccuracyReportPanel | "No lines with offtake history in this filter." |

## Tests (test-engineer writes RED first)
- IndentAccuracyCard.test.tsx: renders average accuracy/bias/sparkline from the query; toggle
  expands/collapses `AccuracyReportPanel`; `accuracyHistoryServerError` → banner + retry.
- AccuracyReportPanel.test.tsx: "By outlet" renders one row per `useListDealerOutletsQuery` item +
  a total row; "By vehicle" toggle switches `groupBy` to `"fert"` and renders FERT rows; clicking a
  FERT row calls `onSelectFert`; keyboard Enter on a FERT row also calls `onSelectFert`;
  `accuracyHistoryEmpty` scenario (by-vehicle) → "No lines with offtake history in this filter."
- Coverage target: 80% (widgets).

## Styling
Semantic tokens only. No `dark:`.

## Teardown
- None — RTK Query hooks unsubscribe automatically.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/widgets/accuracy-summary
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

---
id: TASK-010
status: open
revision: 3
depends-on: [TASK-001]
created: 2026-10-01
---

# TASK-010: widgets/plan-performance — IndentVsDemandCard, StockAgingCard, DemandMixCard, AbpPlaceholderCard

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/widgets/plan-performance/ui/IndentVsDemandCard.tsx | connected | coder | new |
| src/widgets/plan-performance/ui/StockAgingCard.tsx | connected | coder | new |
| src/widgets/plan-performance/ui/DemandMixCard.tsx | connected | coder | new |
| src/widgets/plan-performance/ui/AbpPlaceholderCard.tsx | presentational | component-generator | new |
| src/widgets/plan-performance/index.ts | public api | coder | new |
| src/widgets/plan-performance/ui/AbpPlaceholderCard.stories.tsx | story | component-generator | new |
| src/widgets/plan-performance/ui/IndentVsDemandCard.test.tsx | test | test-engineer | new |
| src/widgets/plan-performance/ui/StockAgingCard.test.tsx | test | test-engineer | new |
| src/widgets/plan-performance/ui/DemandMixCard.test.tsx | test | test-engineer | new |
| src/widgets/plan-performance/ui/AbpPlaceholderCard.test.tsx | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: `useListDealerIndentLinesQuery` (`entities/indent-line`) — all three data cards are
  client-side aggregations over this already-loaded list; no dedicated summary endpoint exists
  (per api-integration-points.md note — if this becomes a perf issue, revisit with
  store-architect/hybrid-api-config later, out of scope for this TASK). `AbpPlaceholderCard` is
  fully static (no data need at all — confirmed by components.md: dealer-level ABP scoring doesn't
  exist yet, the ASM sees the cluster figure).
- Client state: none.
- Mutations: none.
- Errors: `IndentVsDemandCard`/`StockAgingCard`/`DemandMixCard` share the `listDealerIndentLines`
  error/loading/empty states (banner + retry, standard per AGENTS.md §3).
- No fetch/axios/useState for server data (AGENTS.md §3).

## Components

### IndentVsDemandCard (connected)
- Props: `onShowOffTrack?: () => void` (optional — no explicit navigation target in source UX)
- Shows: July indent total, 3-month offtake total, comparison pill (±15% = ok, else warn/crit) vs
  monthly run-rate, last cycle's planned figure with its own comparison pill.
- A11y: pill color always paired with text ("+n% vs monthly run-rate").

### StockAgingCard (connected)
- Props: `onShowAged180: () => void`
- Shows: total units on hand, units over 60 days (highlighted), 4-segment stacked bar (<60D /
  60–90D / 90–180D / >180D) with legend, "Show over 180 days →" button.
- A11y: each bar segment gets a visually-hidden text equivalent alongside its `title` tooltip
  (fixes the components.md-noted gap — tooltip-only content isn't reachable by keyboard/SR).

### DemandMixCard (connected)
- Props: none (fully derived from the query)
- Shows: total FERT count, 3-segment stacked bar (Runner/Repeater/Stranger) with legend + caption.
- A11y: same visually-hidden text-equivalent fix as StockAgingCard.

### AbpPlaceholderCard (presentational)
- Props: none
- Shows: "Not yet available" + explanation text (static copy, no data — matches components.md
  verbatim).

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| loading | IndentVsDemandCard/StockAgingCard/DemandMixCard | skeleton |
| error | same three | banner + retry (`indentLinesServerError` scenario) |
| empty | same three | standard empty state (0 lines in scope) |
| success | same three | full KPI display per components.md |
| not-available (permanent) | AbpPlaceholderCard | static explanatory copy, never changes |

## Tests (test-engineer writes RED first)
- IndentVsDemandCard.test.tsx: renders indent/offtake totals and the correct pill tone for
  ok/warn/crit thresholds (±15%); `indentLinesServerError` → banner + retry.
- StockAgingCard.test.tsx: renders the 4-segment bar with correct proportions from fixture data;
  each segment has a visible/SR-reachable band name + count, not just a `title`; "Show over 180
  days →" calls `onShowAged180`; `indentLinesEmpty` → standard empty treatment.
- DemandMixCard.test.tsx: traces all `DemandMixCard` states by name — loading renders the skeleton
  and then releases/settles any pending handler; `indentLinesServerError` renders banner + retry;
  `indentLinesEmpty` renders the standard empty treatment; success renders total FERT count, the
  Runner/Repeater/Stranger stacked-bar segments, visible/SR-reachable segment names + counts, and
  the caption summarizing line counts per segment.
- AbpPlaceholderCard.test.tsx: traces the permanent `not-available` state by asserting the "Not yet
  available" heading/status copy and the static explanation that dealer-level ABP targets are not
  reliable yet and the ASM sees the cluster figure; asserts no retry/loading/data-driven controls are
  rendered.
- Coverage target: 80% (widgets).

## Styling
Semantic tokens only — stacked-bar segment colors use the semantic tone tokens (ok/warn/crit),
resolving design-tokens.md's "90–180D bar uses a distinct raw `#D97706`" note by collapsing it onto
the `warning` token family (styling-engineer's call, confirmed in `plan/design-system.md`).

## Teardown
- None — RTK Query hooks unsubscribe automatically.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/widgets/plan-performance && npm run build-storybook
```

## Review scope note
- TASK-010 is eligible for review on task-local evidence when TASK-owned focused tests, TASK-owned
  scoped lint, and Storybook are green.
- If repository-wide gates fail, classify each failing file as `TASK-owned`, `dependency TASK`,
  `later open TASK`, or `pre-existing baseline`. Do not block TASK-010 for failures exclusively in
  later open TASKs (for example open TASK-016 `WorkbookPage`) or documented baseline defects (for
  example `tools/check-install.mjs` lint) unless a TASK-010 file is implicated.
- Do not implement or otherwise plan TASK-016 while reviewing TASK-010; resume the earliest open
  dependency/order item from `plan/PROGRESS.md` after TASK-010 review.

## Reflections applied
- notes/memory/reflections/TASK-016-started-before-dependencies.md: Dispatch an in-progress TASK
  only after all of its `Depends on` TASKs are `done`; otherwise reset/reorder it and resume the
  earliest open dependency in `plan/PROGRESS.md` order.
- notes/memory/reflections/TASK-016-started-before-dependencies.md: Accept a TASK as locally
  complete when all TASK-owned tests and scoped lint/build evidence are green and full-gate failures
  are exclusively from later open TASKs or documented baseline defects.
- notes/memory/reflections/TASK-007-test-verification-timeout-hang.md: Require loading-state tests
  to release pending handlers, await a completed UI/network state after release, and prove two
  consecutive focused Vitest runs complete under explicit per-test timeouts before handoff.
- notes/memory/reflections/TASK-007-test-file-baseapi-static-violation.md: Remove direct API-layer
  imports from TSX tests and preserve async cleanup by resolving pending MSW handlers, awaiting
  post-resolution UI assertions, and unmounting rendered views instead of dispatching `baseApi` from
  test files.
- notes/memory/reflections/TASK-007-review-submit-modal-preview-schema-contract.md: Map every
  connected-component summary value and closing-note phrase to an explicit API schema field or
  remove/revise the UI requirement before dispatch, then require implementation evidence that each
  mapped field is rendered.
- notes/memory/reflections/TASK-007-commitbar-cycle-summary-contract.md: Verify every connected
  component against each named server-data hook and each exact TASK text template before marking
  GREEN.

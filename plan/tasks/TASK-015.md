---
id: TASK-015
status: open
revision: 1
depends-on: [TASK-006, TASK-008, TASK-009, TASK-010, TASK-011, TASK-012]
created: 2026-10-01
---

# TASK-015: pages/home — HomePage (HomeDashboard)

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/pages/home/ui/HomePage.tsx | page | coder | new |
| src/pages/home/index.ts | public api | coder | new |
| src/pages/home/ui/HomePage.test.tsx | test | test-engineer | new |
| e2e/home.spec.ts | e2e | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: none directly — this page is composition only (AGENTS.md §2 pages layer); all data
  hooks are owned by the widgets it composes (`widgets/topbar`, `widgets/home-summary`,
  `widgets/plan-performance`, `widgets/accuracy-summary`, `widgets/rollup`).
- Client state: `exportOpen` (D24, local state) to drive `features/export-indent`'s `ExportModal`;
  active vertical/navigation intent passed down to `widgets/topbar` as `activeView="home"`.
- Mutations: none directly.
- Errors: n/a at the page level — each composed widget handles its own 4 states.
- No fetch/axios/useState for server data (AGENTS.md §3) — zero business logic in this file.

## Components

### HomeDashboard (page — `HomePage.tsx`)
- Props: none (route component; reads `dealer`/`verticals` from `entities/session`/`entities/cycle`
  hooks only to pass minimal display props into composed widgets, no data transformation logic)
- Shows: page greeting (`h1`), vertical/outlet subtitle, Export/Continue actions, card zones
  (`IndentProgressCard`, `VerticalsSummaryCard`, `NeedsAttentionCard`, `IndentVsDemandCard`,
  `StockAgingCard`, `DemandMixCard`, `AbpPlaceholderCard`, `IndentAccuracyCard`), `RollupTable`
  zone.
- Interactions: Export opens `ExportModal` (`features/export-indent`); "Continue indent →"
  navigates to `/workbook` (route from `@shared/config` `routes.workbook`).
- A11y: exactly one `h1` (`#hGreet`-equivalent); card group headings are `h3`, no skipped levels.
- Responsive: cards grid `repeat(auto-fit,minmax(262px,1fr))` via Tailwind arbitrary-value grid
  utility or a `plan/design-system.md`-defined utility class; lead/full cards collapse to 1 column
  at mobile width (Tailwind `sm:`/base, not the raw `760px` value).
- Route: `/` (guarded by `RequireAuth`, per `app/router.tsx` — app-bootstrap's file, not touched
  here).

## UI states (from analysis/ui-states.md)
All states belong to the composed widgets (TASK-008 through TASK-012); this page has no states of
its own beyond composing them.

## Tests (test-engineer writes RED first)
- HomePage.test.tsx (rendered with `renderWithProviders`): renders exactly one `h1`; renders
  `TopBar` with `activeView="home"`; renders all composed widget zones; "Continue indent →"
  navigates to `/workbook`; Export button opens `ExportModal`.
- Coverage target: 70% (pages are not features/widgets).

## E2E (page TASK)
- `e2e/home.spec.ts` (owner test-engineer): route `/` renders with `h1` present; axe (WCAG 2.2 AA)
  has no serious/critical violations in light AND dark; no horizontal overflow at mobile width; no
  console errors. Runs at release scope (after `/workbook`'s route wiring lands) — not part of this
  TASK's GREEN.

## Styling
Semantic tokens only. No `dark:` beyond what `ThemeProvider`'s class-based switching already
handles.

## Teardown
- None — composition only, no timers/listeners/AbortControllers of its own.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/pages/home && npm run build
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

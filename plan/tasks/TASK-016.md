---
id: TASK-016
status: open
revision: 2
depends-on: [TASK-004, TASK-005, TASK-006, TASK-007, TASK-008, TASK-013, TASK-014]
created: 2026-10-01
---

# TASK-016: pages/workbook — WorkbookPage

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/pages/workbook/ui/WorkbookPage.tsx | page | coder | new |
| src/pages/workbook/index.ts | public api | coder | new |
| src/pages/workbook/ui/WorkbookPage.test.tsx | test | test-engineer | new |
| e2e/workbook.spec.ts | e2e | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: none directly — composition only (AGENTS.md §2); data hooks live in the composed
  widgets/features (`widgets/indent-grid`, `widgets/workbook-toolbar`, `features/filter-indent`,
  `features/submit-indent`, `features/add-fert-line`, `features/export-indent`).
- Client state: this page is the natural owner of the state that must be **shared across** its
  composed widgets/features (since none of them may import a sibling directly, per AGENTS.md §2's
  import matrix — features/widgets can't import each other): active filters (D18, lifted from
  `FilterRail`), search query (D19), sort (D21), column-band mode/density/rail-collapsed (D22),
  selected line/drawer open (D23), and the three modals' open/closed flags (D24). All local
  `useState`/`useReducer` in this page component — no slice (none of D18–D24 qualify as "server
  data" or a cross-cutting concern under AGENTS.md §3).
- Mutations: none directly.
- Errors: n/a at the page level — each composed widget/feature handles its own 4 states.
- No fetch/axios/useState for server data (AGENTS.md §3) — the `useState` here holds only local UI
  state (D18–D24), never server data.

## Components

### WorkbookPage (page)
- Props: none (route component)
- Composes: `TopBar` (`activeView="workbook"`), `WorkbookToolbar`, `FilterRail`, `IndentGrid`,
  `LineDetailDrawer`, `CommitBar`, `AddFertModal`, `ExportModal`, `ReviewSubmitModal`,
  `ColumnsPopover` (via `WorkbookToolbar`).
- Wiring: passes `filters`/`query`/`sort`/`bandMode`/`density`/`railCollapsed`/`selectedLineId`/
  modal-open flags down as props; passes each feature's callbacks (`onRemoveToken`,
  `onOpenDetail`, `onAddFert`, `onExport`, `onReviewSubmit`, etc.) back up into this page's
  `useState` setters — this is the composition glue AGENTS.md §2 reserves for the pages layer.
- A11y: exactly one `h1` per page (workbook title); heading levels don't skip across the composed
  widgets.
- Route: `/workbook` (guarded by `RequireAuth`, per `app/router.tsx` — app-bootstrap's file, not
  touched here).

## UI states (from analysis/ui-states.md)
All states belong to the composed widgets/features (TASK-004 through TASK-007, TASK-013,
TASK-014); this page has no states of its own beyond owning the shared local UI state (D18–D24)
that makes those widgets/features' props correct.

## Tests (test-engineer writes RED first)
- WorkbookPage.test.tsx (rendered with `renderWithProviders`): renders exactly one `h1`; renders
  `TopBar` with `activeView="workbook"`; renders `WorkbookToolbar`, `FilterRail`, `IndentGrid`,
  `CommitBar`; selecting a filter in `FilterRail` updates `WorkbookToolbar`'s token chips (proves
  the lifted-state wiring, not re-testing `FilterRail`'s own internals); "+ Add FERT" opens
  `AddFertModal`; "ⓘ" in the grid opens `LineDetailDrawer` with the right line; "Review & submit"
  opens `ReviewSubmitModal`.
- Coverage target: 70% (pages are not features/widgets).

## E2E (page TASK)
- `e2e/workbook.spec.ts` (owner test-engineer): route `/workbook` renders with `h1` present; axe
  (WCAG 2.2 AA) has no serious/critical violations in light AND dark; no horizontal overflow at
  mobile width (note: `IndentGrid` itself is intentionally not mobile-optimized per FSD §6.1 — the
  mobile-overflow check applies to the page chrome around it, e.g. `TopBar`/`WorkbookToolbar`/
  `FilterRail`, not the grid's own internal horizontal scroll, which is expected); no console
  errors. Runs at release scope — not part of this TASK's GREEN.

## Styling
Semantic tokens only. No `dark:` beyond `ThemeProvider`'s class-based switching.

## Teardown
- None of its own — composed widgets/features own their own manual resources (already listed in
  their TASKs); this page only holds `useState`, no timers/listeners/AbortControllers.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/pages/workbook && npm run build
```

## Reflections applied
- notes/memory/reflections/TASK-016-started-before-dependencies.md: Dispatch an in-progress TASK only after all of its `Depends on` TASKs are `done`; otherwise reset/reorder it and resume the earliest open dependency in `plan/PROGRESS.md` order. Applied by keeping TASK-016 open until TASK-008, TASK-013, and TASK-014 are done; no component/API contract changes.

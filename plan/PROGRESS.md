# plan/PROGRESS.md

Demand Planning Workbench — Dealer persona, Phase 0. 16 TASKs, bottom-up: shared/ui → features →
widgets → pages. Entities layer has no TASKs (no presentational UI of its own per
`plan/fsd-structure.md` — its `api/*.ts` + `entities/session/model/sessionSlice.ts` are
store-architect's Phase 3a work, not planned here). Store/theme foundation (store-architect,
styling-engineer) also not planned here — see AGENTS.md §11 / architect mode instructions.

| TASK | Slice | Goal | Depends on | Status |
|---|---|---|---|---|
| TASK-001 | shared/ui | Button, Input, Select, Badge, Modal, Toast | — | done |
| TASK-002 | features/auth-login | LoginForm | TASK-001 | done |
| TASK-003 | features/edit-indent-line | EditableQtyCell (reconstructed — see G1 note) | TASK-001 | done |
| TASK-004 | features/filter-indent | FilterRail, MultiSelectFilter (no saved-views persistence — see G2 note) | TASK-001 | done |
| TASK-005 | features/add-fert-line | AddFertModal | TASK-001 | done |
| TASK-006 | features/export-indent | ExportModal, buildIndentCsv | TASK-001 | done |
| TASK-007 | features/submit-indent | CommitBar, ReviewSubmitModal (Reopen business rule unconfirmed — see G4 note) | TASK-001 | done |
| TASK-008 | widgets/topbar | TopBar | TASK-001 | done |
| TASK-009 | widgets/home-summary | IndentProgressCard, VerticalsSummaryCard, NeedsAttentionCard | TASK-001 | done |
| TASK-010 | widgets/plan-performance | IndentVsDemandCard, StockAgingCard, DemandMixCard, AbpPlaceholderCard | TASK-001 | done |
| TASK-011 | widgets/accuracy-summary | IndentAccuracyCard, AccuracyReportPanel | TASK-001 | done |
| TASK-012 | widgets/rollup | RollupTable | TASK-001 | done |
| TASK-013 | widgets/workbook-toolbar | WorkbookToolbar, ColumnsPopover | TASK-001, TASK-004, TASK-005, TASK-006 | done |
| TASK-014 | widgets/indent-grid | IndentGrid, LineDetailDrawer | TASK-001, TASK-003 | done |
| TASK-015 | pages/home | HomePage (HomeDashboard) | TASK-006, TASK-008, TASK-009, TASK-010, TASK-011, TASK-012 | in-progress |
| TASK-016 | pages/workbook | WorkbookPage | TASK-004, TASK-005, TASK-006, TASK-007, TASK-008, TASK-013, TASK-014 | open |

Status values: `open → in-progress → done` (test-engineer sets in-progress, reviewer sets done).

## Coverage of component-owners.md / analysis/components.md

All 29 `covered` + 1 `partial` (G1) elements from `plan/coverage-matrix.md` are assigned to exactly
one TASK above. `PersonaSwitcher` (excluded) and the four confirmed-decorative element groups are
not planned, per fsd-structure.md/component-owners.md. Primitives (Button, Select, Input, Badge,
Modal, Toast) are in TASK-001; every other row maps 1:1 to its owning slice's TASK.

## Open items carried into TASKs (per architect dispatch — not separately re-resolved)

- **G1** (`EditableQtyCell` not separately catalogued) — TASK-003 reconstructs its contract from
  `IndentGrid`'s "Reuses" note + `ui-states.md`'s IndentGrid states; flagged in-file for
  reviewer/wireframe-analyzer follow-up.
- **G2** (D20 saved filter views, TBD persistence) — excluded from TASK-004; `FilterRail` ships
  with `no-saved-views` only, no "Save view" affordance, no `savedViews`/`onSaveView`/`onApplyView`
  props.
- **G3** (12 personas not analysed) — out of scope for this plan entirely, no TASK references them.
- **G4** (`reopenDealerIndent` business rule unconfirmed) — included in TASK-007 (CommitBar
  "Reopen" + mocked endpoint call) with an explicit open-question flag for reviewer/human
  confirmation (self-service vs requires-approval).

## Foundation work (not TASKs — tracked here for traceability only)

| Work item | Owner | Phase |
|---|---|---|
| `app/store`, `combineSlices`, `RootState`/`AppStore`/`AppDispatch`, `entities/session/model/sessionSlice.ts`, all `entities/*/api/*.ts` + `features/*/api/*.ts` (RTK Query `injectEndpoints`) | store-architect | 3a |
| `tailwind.config.ts`, `src/shared/ui/theme/**` | styling-engineer | 3a |
| `src/app/router.tsx`, `src/app/providers/**`, `src/shared/config/routes.ts` extension | app-bootstrap | 3a |

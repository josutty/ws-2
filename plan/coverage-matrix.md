---
stage: tasks
scope: all
generated: 2026-10-06
extractor: node tools/list-html-elements.mjs inputs/ux/dealer.html
---
# Coverage — 32 elements · 29 covered · 1 partial (G1) · 1 missing (G5) · 1 out-of-scope · TASK-007 repair trace has 1 partial integration gap (G7) · TASK-010 revision 3 trace repaired G8 · 14/14 API operations trace to a consuming TASK (1 file-ownership gap, G6) · 27/28 data needs covered (1 gap, G2, resolved-by-exclusion) · 12 personas still not analysed (G3, unresolved)

Screen analysed: **dealer** (`inputs/ux/dealer.html`). At stage=tasks the trace extends to
**TASK id + named implementation file** (component-owners.md's FSD slice/owner is no longer the
stopping point). Route/test-file/e2e columns are stage=release's job where a route doesn't yet
exist to check against; noted here only where a TASK's own file table already commits to one
(`e2e/home.spec.ts`, `e2e/workbook.spec.ts`).

## Gaps (read this first)

| # | Type | Item | Missing link | Status vs stage=plan | Suggested route |
|---|---|---|---|---|---|
| G1 | element | `EditableQtyCell` (`features/edit-indent-line/ui`) | Now has TASK-003 + `src/features/edit-indent-line/ui/EditableQtyCell.tsx`, but its props/states are still **reconstructed** from `IndentGrid`'s spec, not from a standalone `### EditableQtyCell` entry in `analysis/components.md` — TASK-003's own header flags this in-file and asks for a bumped revision once resolved. | **Handled as expected, still unresolved at the root** — architect proceeded to a TASK (not blocked on it) but the underlying analysis gap from stage=plan is unchanged. | wireframe-analyzer delta (unchanged from stage=plan) → re-run TASK-003 at rev 2. |
| G2 | data need | D20 — Saved filter views (`FilterRail`) | TASK-004 does **not** wait for a human decision on server vs session-only persistence (stage=plan's suggested route). It resolves the ambiguity itself by **omitting** the feature entirely: `FilterRail` ships `no-saved-views` only, no `savedViews`/`onSaveView`/`onApplyView` props, and TASK-004 adds an explicit regression test that no "Save view" UI is ever rendered. | **Handled differently than expected** — stage=plan suggested "architect/human decision first, then plan the slice+endpoint"; architect instead decided *not* to build it at all for this pass, without a recorded human sign-off on which persistence model was rejected. Functionally safe (nothing fake is shipped) but the business question (Q3) is still open. | Confirm with a human/business that "omit for Phase 0" (vs. build session-only) is the accepted answer; if so, close Q3 explicitly instead of leaving it implicitly answered by omission. |
| G3 | persona/screen | 12 personas named in inputs/fsd-spec.md §3 but not analysed | Unchanged — no TASK references any of the 12 personas; `plan/PROGRESS.md` explicitly scopes this TASK breakdown to the Dealer persona only. | **Unresolved, as expected** — correctly still out of scope, not silently dropped. | wireframe-analyzer, once UX files exist under `inputs/ux/` for those personas. |
| G4 | business rule | D5 — `reopenDealerIndent` (CommitBar "Reopen") | TASK-007 includes the button + mocked endpoint call and carries an explicit in-file flag: "Reviewer/human: confirm this before treating the current contract ... as final." | **Unresolved, on track** — matches stage=plan's suggested route (architect includes the UI, defers the business-rule confirmation to reviewer/human). Not newly resolved, not newly broken. | reviewer/human confirms self-service vs requires-approval; bump TASK-007 if the rule changes the contract. |
| G5 | **element (new)** | `pages/sign-in` (`SignInPage.tsx`) | `plan/fsd-structure.md` plans `pages/sign-in/ui/SignInPage.tsx` at route `/sign-in`, composing `features/auth-login` + `entities/cycle` (pre-auth cycle banner); `plan/component-owners.md`'s "Non-component work" table commits test-engineer to an `e2e/**` smoke spec for `/sign-in`; `plan/api-integration-points.md` names `pages/sign-in` as the consumer of `getCurrentCyclePreview`. **No TASK plans this file.** `plan/PROGRESS.md`'s 16-TASK list has a page TASK for `pages/home` (TASK-015) and `pages/workbook` (TASK-016) but none for `pages/sign-in`. TASK-002 (`features/auth-login`) absorbed the cycle-preview banner directly into `LoginForm` itself instead, but nothing composes `LoginForm` at an actual route, and no `e2e/sign-in.spec.ts` exists in any Files table. | **New — introduced by (or at least first visible at) the TASK breakdown.** stage=plan's element list didn't separately enumerate a sign-in page container (only `LoginForm` itself, row 1), so this didn't surface as a plan-stage placement gap; it only becomes visible once tracing requires a route + TASK id. | architect: add a TASK (e.g. TASK-017, `pages/sign-in`, depends-on TASK-002) with Files `src/pages/sign-in/ui/SignInPage.tsx`, `src/pages/sign-in/index.ts`, `src/pages/sign-in/ui/SignInPage.test.tsx`, `e2e/sign-in.spec.ts` — analogous to TASK-015/TASK-016 — before app-bootstrap wires `/sign-in` into `app/router.tsx`. |
| G6 | **shared dependency (new)** | `shared/lib/format` (Intl number/date helpers) | `plan/fsd-structure.md` plans `shared/lib/format/` and `plan/component-owners.md` lists it as a direct dependency of `TopBar` (TASK-008) and `IndentVsDemandCard` (TASK-010, and by the same pattern likely `StockAgingCard`/`DemandMixCard`/`IndentAccuracyCard`/`AccuracyReportPanel`, which format units/%/dates too). **No TASK's Files table creates `src/shared/lib/format/**`** — it isn't in TASK-001 (shared/ui only) or any consumer TASK. `AGENTS.md` §11's ownership table also has no row for `src/shared/lib/format/**` (only `src/shared/lib/logger/**` → app-bootstrap and `src/shared/lib/store/**` → store-architect are named). | **New — introduced by the TASK breakdown.** At stage=plan this was a placement note inside component-owners.md's dependency column, not a traced "does a TASK create this" question. | architect: add a `shared/lib/format` TASK (owner component-generator or coder, no dependents since it's pure functions) before TASK-008/TASK-010 start, or explicitly amend AGENTS.md §11 + the first consuming TASK's Files table to claim ownership — otherwise TASK-008 and TASK-010 will each be tempted to write their own copy, or typecheck will fail on an unresolved import. |
| G7 | **TASK-007 integration (new)** | `ReviewSubmitModal` filtered/added notice count props | TASK-007 revision 2 correctly removes non-schema `SubmitPreview` fields and maps `filteredLineCount` / `addedLineCount` to explicit props, but the only composing page TASK (`TASK-016`, `src/pages/workbook/ui/WorkbookPage.tsx`) still says it passes modal-open flags and callbacks; it does **not** name or test passing `filtered`, `filteredLineCount`, `addedLineCount`, or `onReviewMissing` into `ReviewSubmitModal`. The prop-level component contract is covered by TASK-007, but the source-owner chain for those view-local values stops before a composing TASK/test. | **New — surfaced by TASK-007 revision 2 design repair.** The schema mismatch is resolved inside TASK-007; this is the remaining traceability gap from prop source to page composition. | architect: amend TASK-016 (or add a tiny integration follow-up) to pass and test `ReviewSubmitModal`'s view-local count props from the workbook's lifted filter/line-list state, including the `onReviewMissing` jump-to-`noentry` callback. |
## Scope conflicts flagged (not coverage gaps — already have FSD placement, carried forward for visibility)

Unchanged from stage=plan — no TASK resolves or contradicts these; they remain open business
questions, not placement gaps:

- **Q1** — Pipeline/retail trend columns shipped in Phase 0 UI (TASK-014's IndentGrid, TASK-012's
  RollupTable "Trend-offtake"/"Trend-retail" bands) though `inputs/fsd-spec.md` §2 calls them Phase 1.
- **Q2** — Dealer opening FG inventory field (TASK-014's IndentGrid "Opening & live POs" band) vs.
  FSD §6.5 saying it's "not currently a field."
- **Q4** — Pipeline/retail trend source systems unconfirmed; doesn't block TASK-014/TASK-012 placement.
- **Q7** — OI-01 (no-entry auto-submit default) unconfirmed; TASK-007's CommitBar/ReviewSubmitModal
  copy already assumes one answer.

## Out of scope (confirmed exclusions — not gaps)

Unchanged from stage=plan — no TASK plans any of these, consistent with their exclusion:

| Item | Reason |
|---|---|
| `PersonaSwitcher` (`#personaSel`) | Confirmed excluded in `fsd-structure.md`/`component-owners.md`; no TASK references it. |
| `.meter i` / `.sbar i` / `.spark i` bar-chart fill segments | Decorative, covered under their owning cards' TASKs (TASK-009/010/011). |
| `#scrim` | Part of `Modal`'s own focus-trap/backdrop behavior (TASK-001), not separate. |
| `.zone .zr` rule lines, `.sep` separators | Decorative, no TASK. |
| D28 — persona selection | Non-production, ties to `PersonaSwitcher` exclusion. |

---

## Elements

Columns adapted to stage=plan (TASK/file/route/test are stage=tasks/release columns, not yet applicable).

| # | Component | Slice | TASK | File | Status |
|---|---|---|---|---|---|
| 1 | LoginForm | `features/auth-login/ui` | TASK-002 | `src/features/auth-login/ui/LoginForm.tsx` | covered |
| 2 | TopBar | `widgets/topbar/ui` | TASK-008 | `src/widgets/topbar/ui/TopBar.tsx` | covered |
| 3 | PersonaSwitcher | — (excluded) | — | — | out-of-scope |
| 4 | HomeDashboard | `pages/home/ui` | TASK-015 | `src/pages/home/ui/HomePage.tsx` | covered |
| 5 | IndentProgressCard | `widgets/home-summary/ui` | TASK-009 | `src/widgets/home-summary/ui/IndentProgressCard.tsx` | covered |
| 6 | VerticalsSummaryCard | `widgets/home-summary/ui` | TASK-009 | `src/widgets/home-summary/ui/VerticalsSummaryCard.tsx` | covered |
| 7 | NeedsAttentionCard | `widgets/home-summary/ui` | TASK-009 | `src/widgets/home-summary/ui/NeedsAttentionCard.tsx` | covered |
| 8 | IndentVsDemandCard | `widgets/plan-performance/ui` | TASK-010 | `src/widgets/plan-performance/ui/IndentVsDemandCard.tsx` | covered (see G6 — `shared/lib/format` dependency unowned) |
| 9 | StockAgingCard | `widgets/plan-performance/ui` | TASK-010 | `src/widgets/plan-performance/ui/StockAgingCard.tsx` | covered |
| 10 | DemandMixCard | `widgets/plan-performance/ui` | TASK-010 | `src/widgets/plan-performance/ui/DemandMixCard.tsx` | covered |
| 11 | AbpPlaceholderCard | `widgets/plan-performance/ui` | TASK-010 | `src/widgets/plan-performance/ui/AbpPlaceholderCard.tsx` | covered |
| 12 | IndentAccuracyCard | `widgets/accuracy-summary/ui` | TASK-011 | `src/widgets/accuracy-summary/ui/IndentAccuracyCard.tsx` | covered |
| 13 | AccuracyReportPanel | `widgets/accuracy-summary/ui` | TASK-011 | `src/widgets/accuracy-summary/ui/AccuracyReportPanel.tsx` | covered |
| 14 | RollupTable | `widgets/rollup/ui` | TASK-012 | `src/widgets/rollup/ui/RollupTable.tsx` | covered |
| 15 | FilterRail | `features/filter-indent/ui` | TASK-004 | `src/features/filter-indent/ui/FilterRail.tsx` | covered (scope narrowed — see G2) |
| 16 | MultiSelectFilter | `features/filter-indent/ui` | TASK-004 | `src/features/filter-indent/ui/MultiSelectFilter.tsx` | covered |
| 17 | WorkbookToolbar | `widgets/workbook-toolbar/ui` | TASK-013 | `src/widgets/workbook-toolbar/ui/WorkbookToolbar.tsx` | covered |
| 18 | ColumnsPopover | `widgets/workbook-toolbar/ui` | TASK-013 | `src/widgets/workbook-toolbar/ui/ColumnsPopover.tsx` | covered |
| 19 | IndentGrid | `widgets/indent-grid/ui` | TASK-014 | `src/widgets/indent-grid/ui/IndentGrid.tsx` | covered |
| 20 | EditableQtyCell | `features/edit-indent-line/ui` | TASK-003 | `src/features/edit-indent-line/ui/EditableQtyCell.tsx` | **partial — see G1** |
| 21 | CommitBar | `features/submit-indent/ui` | TASK-007 | `src/features/submit-indent/ui/CommitBar.tsx` | covered (Reopen contract open — see G4) |
| 22 | LineDetailDrawer | `widgets/indent-grid/ui` | TASK-014 | `src/widgets/indent-grid/ui/LineDetailDrawer.tsx` | covered |
| 23 | AddFertModal | `features/add-fert-line/ui` | TASK-005 | `src/features/add-fert-line/ui/AddFertModal.tsx` | covered |
| 24 | ExportModal | `features/export-indent/ui` | TASK-006 | `src/features/export-indent/ui/ExportModal.tsx` | covered |
| 25 | ReviewSubmitModal | `features/submit-indent/ui` | TASK-007 | `src/features/submit-indent/ui/ReviewSubmitModal.tsx` | covered |
| 26 | Toast | `shared/ui` | TASK-001 | `src/shared/ui/Toast.tsx` | covered |
| 27 | Button | `shared/ui` | TASK-001 | `src/shared/ui/Button.tsx` | covered |
| 28 | Select | `shared/ui` | TASK-001 | `src/shared/ui/Select.tsx` | covered |
| 29 | Input | `shared/ui` | TASK-001 | `src/shared/ui/Input.tsx` | covered |
| 30 | Badge (pill) | `shared/ui` | TASK-001 | `src/shared/ui/Badge.tsx` | covered |
| 31 | Modal (dialog shell) | `shared/ui` | TASK-001 | `src/shared/ui/Modal.tsx` | covered |
| 32 | **SignInPage (new row)** | `pages/sign-in/ui` (planned in fsd-structure.md) | **none** | `src/pages/sign-in/ui/SignInPage.tsx` (not yet planned by any TASK) | **missing — see G5** |

## UI states

Grouped by owning component; TASK column is where the state is implemented/tested (test names
quoted from each TASK's own "Tests" section, not yet verified against real test files — that's
stage=release's job).

| Component | States | TASK | Status |
|---|---|---|---|
| LoginForm | default · invalid-unknown-identifier · invalid-wrong-password · submitting · error (network/default) · cycle-banner-error | TASK-002 | covered |
| TopBar | default · cutoff-imminent · submitted · cycle-summary-error | TASK-008 | covered |
| IndentProgressCard | loading/error · not-submitted · submitted | TASK-009 | covered |
| VerticalsSummaryCard | not-started · in-progress · submitted | TASK-009 | covered |
| NeedsAttentionCard | loading/error · empty · populated | TASK-009 | covered |
| IndentVsDemandCard / StockAgingCard / DemandMixCard | loading/error/empty · success | TASK-010 | covered — TASK-010 revision 3 names `DemandMixCard.test.tsx` state/display assertions alongside the existing IndentVsDemand/StockAging tests (G8 resolved) |
| AbpPlaceholderCard | not-available (permanent) | TASK-010 | covered — TASK-010 revision 3 names `AbpPlaceholderCard.test.tsx` assertions for the permanent copy/state and no retry/loading/data-driven controls (G8 resolved) |
| IndentAccuracyCard | loading/error · collapsed | TASK-011 | covered (see note below) |
| AccuracyReportPanel | loading/error · expanded-by-outlet · expanded-by-vehicle · empty-by-vehicle | TASK-011 | covered |
| RollupTable | loading/error · default-grouping · row-expanded · band summary/full/off | TASK-012 | covered |
| FilterRail | expanded · collapsed · filters-active · no-saved-views | TASK-004 | covered — `saved-views-present` intentionally **not** implemented (G2, not a test gap, a scope decision) |
| MultiSelectFilter | closed · open · option-disabled · no-match | TASK-004 | covered |
| WorkbookToolbar | no-filters · filters-active | TASK-013 | covered |
| ColumnsPopover | closed · open | TASK-013 | covered |
| IndentGrid | loading/error · empty · success-editable · success-locked · row-no-entry · row-added · cell-carry-forward-hint · sorted · band-collapsed/expanded · multi-cell-paste · cell-conflict(409) | TASK-014 | covered |
| CommitBar | not-submitted-no-missing · not-submitted-some-missing · filtered-view · submitted · reopen-pending · reopen-conflict(409) | TASK-007 | covered (see G4) |
| LineDetailDrawer | closed · open · segment-mismatch · aged-stock-present | TASK-014 | covered |
| AddFertModal | closed/open · loading · error · empty/no-match · no-selection · selection-made · submitting · conflict(409) | TASK-005 | covered |
| ExportModal | default · copy-success · copy-fallback | TASK-006 | covered |
| ReviewSubmitModal | clean · filtered-warning · missing-entries-warning · added-lines-notice · submitting · preview-error · submit-conflict(409) | TASK-007 | partial — component-level states/tests are covered by TASK-007, but filtered/added notice prop sources are not traced through the composing page TASK (see G7) |
| Toast | hidden · shown | TASK-001 | covered |
| Grid cell paste / Grid FERT-filter paste | multi-cell paste (TASK-014) · filter paste (TASK-004, `onPasteCodes`) | TASK-014 / TASK-004 | covered |

Note — **IndentAccuracyCard**: `analysis/ui-states.md` groups it with the three plan-performance
cards for `loading/error/empty/success`, but TASK-011 only explicitly names `loading`/`error`
(shared with `AccuracyReportPanel`) and `collapsed` (its one distinctive state); `empty`/`success`
aren't named as separate rows in TASK-011's own states table. Functionally `collapsed` *is* the
success rendering (sparkline+pill visible, ui-states.md marks `empty`/`loading`/`error` all
"standard (not drawn)" for this component anyway), so this is a labeling gap in the TASK's table,
not a missing behavior — not counted as a numbered gap, flagged for the reviewer to double check
TASK-011's test list covers loading/error/success/empty explicitly per AGENTS.md §3's "every
server-data consumer handles 4 states" rule.

## API operations

Source: `plan/generated/endpoints-map.json` (14 operations). The endpoint's own implementation
file (`entities/*/api/*.ts`, `features/*/api/*.ts`) is **store-architect's Phase 3a foundation
work**, not a TASK in this 16-TASK breakdown (per `plan/PROGRESS.md`'s own scope note) — that's
expected, not a gap. What stage=tasks adds is tracing each operation to the **consuming** TASK(s).

| operationId | Consuming TASK(s) | Consumer file | Endpoint file (foundation, no TASK) | Status |
|---|---|---|---|---|
| login | TASK-002 | `src/features/auth-login/ui/LoginForm.tsx` | `src/features/auth-login/api/authApi.ts` | covered |
| getCurrentCyclePreview | TASK-002 | `src/features/auth-login/ui/LoginForm.tsx` | `src/entities/cycle/api/cycleApi.ts` | covered — but see G5: `api-integration-points.md` names `pages/sign-in` as the consumer, not `LoginForm` directly; TASK-002 absorbed it since no sign-in page TASK exists |
| getCurrentUser | TASK-008 | `src/widgets/topbar/ui/TopBar.tsx` | `src/entities/session/api/sessionApi.ts` | covered |
| listDealerOutlets | TASK-011 | `src/widgets/accuracy-summary/ui/AccuracyReportPanel.tsx` | `src/entities/dealer/api/dealerApi.ts` | covered |
| getDealerCycleSummary | TASK-008, TASK-009, TASK-007 | `TopBar.tsx`, `IndentProgressCard.tsx`/`VerticalsSummaryCard.tsx`, `CommitBar.tsx` | `src/entities/cycle/api/cycleApi.ts` | covered |
| listDealerIndentLines | TASK-004, TASK-009, TASK-010, TASK-012, TASK-013, TASK-014 | `FilterRail.tsx`, `NeedsAttentionCard.tsx`, plan-performance cards, `RollupTable.tsx`, `WorkbookToolbar.tsx`, `IndentGrid.tsx`/`LineDetailDrawer.tsx` | `src/entities/indent-line/api/indentLineApi.ts` | covered |
| addDealerIndentLine | TASK-005 | `AddFertModal.tsx` | `src/features/add-fert-line/api/addFertApi.ts` | covered |
| listAvailableProducts | TASK-005 | `AddFertModal.tsx` | `src/features/add-fert-line/api/addFertApi.ts` | covered |
| updateDealerIndentCell | TASK-014 (wiring TASK-003's cell) | `IndentGrid.tsx` | `src/features/edit-indent-line/api/editIndentApi.ts` | covered |
| batchUpdateDealerIndentCells | TASK-014 | `IndentGrid.tsx` | `src/features/edit-indent-line/api/editIndentApi.ts` | covered |
| getDealerAccuracyHistory | TASK-011 | `IndentAccuracyCard.tsx`/`AccuracyReportPanel.tsx` | `src/entities/accuracy/api/accuracyApi.ts` | covered |
| getDealerSubmitPreview | TASK-007 | `ReviewSubmitModal.tsx` | `src/features/submit-indent/api/submitApi.ts` | covered |
| submitDealerIndent | TASK-007 | `ReviewSubmitModal.tsx` | `src/features/submit-indent/api/submitApi.ts` | covered |
| reopenDealerIndent | TASK-007 | `CommitBar.tsx` | `src/features/submit-indent/api/submitApi.ts` | covered — see G4 |

14/14 operations trace to at least one consuming TASK + file. 0 new gaps at the endpoint level
(the sign-in consumer mismatch is filed under G5, not double-counted here).

## Focused trace — TASK-007 revision 2 design repair

| Item | Evidence | Status |
|---|---|---|
| HTML source rows | Extractor rows `90` (`#commit`) and `93`–`98` (`#review`, title, Cancel, Submit indent) from `inputs/ux/dealer.html`. | covered |
| Analysed components | `analysis/components.md` has `### CommitBar` (lines 300–309) and `### ReviewSubmitModal` (lines 348–360). | covered |
| FSD slice + owner | `plan/component-owners.md` maps both to `features/submit-indent/ui`, kind `connected`, owner `coder` (lines 29 and 33). | covered |
| TASK files | `plan/tasks/TASK-007.md` Files table names `CommitBar.tsx`, `ReviewSubmitModal.tsx`, public API, and both focused test files (lines 20–28). | covered |
| SubmitPreview schema contract | Generated schema exposes `SubmitPreview.status`, `lines`, `totals`, `warnings`, `recipient`, `reopenUntil` only (`src/shared/api/generated/schema.d.ts` lines 592–608); TASK-007 revision 2 maps each modal field to those schema paths or explicit props (lines 77–87) and forbids `preview.filteredLineCount` / `preview.addedLineCount` casts (lines 111–119). | covered at component level |
| Filtered/added notice prop source | TASK-007 says the counts come from view-local props owned by the composing workbook/page (lines 35–37, 61–68, 81–83), but `TASK-016` does not yet name/test those props in its composition contract. | **partial — see G7** |
| API operations | `getDealerSubmitPreview`, `submitDealerIndent`, `reopenDealerIndent`, and shared `getDealerCycleSummary` all trace to TASK-007 consumers and endpoint files in the API operations table above. | covered |

## Focused trace — TASK-010 revision 3 design repair

Delta scope: checked only the revised `plan/tasks/TASK-010.md` for G8; did not require TASK-016 implementation.

| Item | Evidence | Status |
|---|---|---|
| HTML source rows | Extractor rows `37`–`54` from `inputs/ux/dealer.html`: "Indent vs demand signal", `#kIndent`/`#kOfftake`/pills, "Stock on hand by age" with `#kStockBar` and "Show over 180 days →", "Demand mix — Runner / Repeater / Stranger" with `#kMixBar`, and "Against ABP". | covered |
| Analysed components | `analysis/components.md` has `### IndentVsDemandCard` (lines 134–142), `### StockAgingCard` (144–154), `### DemandMixCard` (156–164), and `### AbpPlaceholderCard` (166–175). | covered |
| FSD slice + owner | `plan/component-owners.md` maps the first three cards to `widgets/plan-performance/ui`, kind `connected`, owner `coder`, and `AbpPlaceholderCard` to the same slice, kind `presentational`, owner `component-generator` (lines 16–19). | covered |
| TASK files | `plan/tasks/TASK-010.md` Files table names all four component files, the public API, `AbpPlaceholderCard.stories.tsx`, and all four focused test files: `IndentVsDemandCard.test.tsx`, `StockAgingCard.test.tsx`, `DemandMixCard.test.tsx`, and `AbpPlaceholderCard.test.tsx` (lines 14–23). | covered |
| Data contract | TASK-010 revision 3 explicitly uses `useListDealerIndentLinesQuery` for `IndentVsDemandCard`/`StockAgingCard`/`DemandMixCard` and no server data for `AbpPlaceholderCard` (lines 28–33), matching `plan/api-integration-points.md`'s note that plan-performance cards are client-side aggregations over `listDealerIndentLines` (lines 44–48). | covered |
| UI states to tests | TASK-010 lists loading/error/empty/success for the three connected cards and permanent not-available for `AbpPlaceholderCard` (lines 65–72). Its Tests section now names state/display coverage for `DemandMixCard.test.tsx` (lines 80–84) and permanent-copy/no-data-control coverage for `AbpPlaceholderCard.test.tsx` (lines 85–88), in addition to the existing IndentVsDemand/StockAging tests. | covered — G8 resolved |
| Review-scope repair | TASK-010 revision 3 says task-local evidence can make the task reviewable and full-gate failures exclusively in later open TASKs (for example TASK-016) or documented baseline defects must not block TASK-010 (lines 104–112), applying `notes/memory/reflections/TASK-016-started-before-dependencies.md`. | covered; no TASK-016 implementation required now |

## Data needs

Source: `analysis/dataflow.md` (D1–D28). Server-read/mutation needs now show their consuming
TASK(s) in addition to the endpoint; local/client-state needs show the owning TASK.

| # | Need | Placement | Owning/consuming TASK | Status |
|---|---|---|---|---|
| D1 | FERT catalogue + vehicle attributes | `listDealerIndentLines` | TASK-014, TASK-010, TASK-012, TASK-004 | covered |
| D2 | Current-cycle indent quantities | `updateDealerIndentCell`/`batchUpdateDealerIndentCells` | TASK-003 (cell), TASK-014 (grid wiring) | covered |
| D3 | Submission/lock status + cutoff | `getDealerCycleSummary` | TASK-008, TASK-009, TASK-007 | covered |
| D4 | Submit indent | `submitDealerIndent` | TASK-007 | covered |
| D5 | Reopen submitted indent | `reopenDealerIndent` | TASK-007 | covered — see G4 |
| D6 | Stock by age + opening stock + live POs | `listDealerIndentLines` | TASK-010, TASK-014 | covered |
| D7 | Pipeline figures | `listDealerIndentLines` | TASK-014 | covered — see Q4 |
| D8 | Offtake trend | `listDealerIndentLines` | TASK-010, TASK-011, TASK-014 | covered — see Q1 |
| D9 | Retail trend | `listDealerIndentLines` | TASK-011, TASK-014 | covered — see Q1 |
| D10 | Prior-cycle indent value | `listDealerIndentLines` | TASK-003 (hint), TASK-010, TASK-012 | covered |
| D11 | Indent accuracy history | `getDealerAccuracyHistory` | TASK-011 | covered |
| D12 | Dealer's outlet list | `listDealerOutlets` | TASK-011 | covered |
| D13 | Catalogue not on dealer's list | `listAvailableProducts` | TASK-005 | covered |
| D14 | Add FERT to indent | `addDealerIndentLine` | TASK-005 | covered |
| D15 | S&OP cycle metadata | `getCurrentCyclePreview`/`getDealerCycleSummary` | TASK-002, TASK-008, TASK-009, TASK-007 | covered — consumer of `getCurrentCyclePreview` is TASK-002, not a sign-in page TASK (see G5) |
| D16 | Dealer/account profile | `getCurrentUser` | TASK-008 | covered |
| D17 | Authenticate | `login` | TASK-002 | covered |
| D18 | Active filter selections | local state | TASK-004 (owns), lifted by TASK-016 | covered |
| D19 | Search query | local state | TASK-013 (owns), lifted by TASK-016 | covered |
| D20 | Saved filter views | TBD, excluded | none | **gap — see G2** |
| D21 | Sort column + direction | local state | TASK-014 (owns), lifted by TASK-016 | covered |
| D22 | Column band mode, density, rail collapsed | local state | TASK-013/TASK-014/TASK-004 (own), lifted by TASK-016 | covered |
| D23 | Selected line + drawer open | local state | TASK-014 (owns), lifted by TASK-016 | covered |
| D24 | Modal open/closed | local state | TASK-016 (Workbook modals), TASK-015 (`exportOpen`) | covered |
| D25 | Export CSV content | `buildIndentCsv` | TASK-006 | covered |
| D26 | Theme preference | `app/providers` (foundation, no TASK) | consumed by TASK-008 (toggle button) | covered |
| D27 | Rollup group-by + expanded rows | local state | TASK-012 (owns) | covered |
| D28 | Persona selection | out of scope | none | out-of-scope, not a gap |

27/28 data needs trace to a TASK (directly or as a foundation consumer); D20 remains the one gap
(G2, now resolved-by-exclusion rather than left TBD).

---

## Summary

- **Elements**: 32 total (31 carried forward + 1 newly surfaced `SignInPage` row) — 29 covered, 1
  partial (G1, unchanged), 1 missing (**G5, new**), 1 confirmed out-of-scope.
- **UI states**: all implemented states trace to a TASK; `FilterRail`'s `saved-views-present` is
  intentionally not built (G2); `IndentAccuracyCard`'s TASK-011 states table doesn't spell out
  `empty`/`success` by name (flagged, not counted as a numbered gap).
- **API operations**: 14/14 trace to ≥1 consuming TASK; the endpoint implementation files
  themselves are store-architect's Phase 3a foundation work, by design, not a TASK-breakdown gap.
- **Data needs**: 27/28 covered; D20 (G2) is the one gap, now resolved by exclusion rather than
  left open pending a human decision — flagged as "handled differently than expected."
- **New gaps found at this stage**: **G5** (`pages/sign-in` planned in fsd-structure.md /
  component-owners.md / api-integration-points.md but absent from the entire TASK breakdown — no
  TASK, no file, no `e2e/sign-in.spec.ts`) and **G6** (`shared/lib/format` is a dependency of
  TASK-008/TASK-010 but no TASK creates it, and AGENTS.md §11 has no ownership row for it either).
- **Focused TASK-007 revision 2 check**: the schema mismatch is repaired inside TASK-007 (modal
  fields now map to generated `SubmitPreview` paths or explicit props), but the new view-local prop
  source chain is only documented up to "composing workbook/page"; **G7** asks architect to amend
  TASK-016 so page composition passes/tests `filteredLineCount`, `addedLineCount`, and
  `onReviewMissing`.
- **Focused TASK-010 revision 3 check**: **G8 is resolved**. `DemandMixCard` and
  `AbpPlaceholderCard` now have TASK-owned test files and named state/copy assertions in
  `plan/tasks/TASK-010.md`; the review-scope repair remains traceable and does not require TASK-016
  implementation now.
- **Personas/screens out of analysis scope**: still 12 (G3), correctly deferred, unresolved.

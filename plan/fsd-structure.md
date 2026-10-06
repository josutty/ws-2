# FSD Structure — Demand Planning Workbench (Dealer persona, Phase 0)

Scope note: `analysis/components.md` / `dataflow.md` / `ui-states.md` only cover the **Dealer**
screen (`inputs/ux/dealer.html`). The FSD (`inputs/fsd-spec.md`) names twelve more personas
(CSM/ASM, RSM, VH, ISO, COCO ×3, IB ×3, IS, NPI) whose prototype files are not present in this
workspace. This plan therefore places **only the Dealer slice tree**. The layer skeleton below
is shaped so the other personas slot in later without restructuring (e.g. `entities/indent-line`,
`entities/cycle` and `entities/accuracy` are written persona-agnostic where the schema already is;
persona-specific screens get their own `pages/<persona>-*` and `widgets/<persona>-*` later).
See the compliance table at the end for exactly what is / isn't covered.

## app/
- `app/store/` — root store, `combineSlices`, `RootState`/`AppStore`/`AppDispatch` types (store-architect)
- `app/providers/` — `RequireAuth` layout route, `ThemeProvider` (light/dark + `prefers-color-scheme`
  fallback, backs D26), toast host (renders `shared/ui/Toast` off a small app-level event/slice) (app-bootstrap)
- `app/router.tsx` — routes: `/sign-in`, `/` (Home), `/workbook` (app-bootstrap)

## pages/
- `pages/sign-in/` — `ui/SignInPage.tsx` — route `/sign-in` — composes `features/auth-login`
  + `entities/cycle` (pre-auth cycle banner). Public route (no `RequireAuth`).
- `pages/home/` — `ui/HomePage.tsx` — route `/` — composes `widgets/topbar`, `widgets/home-summary`,
  `widgets/plan-performance`, `widgets/accuracy-summary`, `widgets/rollup`, `features/export-indent`.
  Guarded by `RequireAuth`.
- `pages/workbook/` — `ui/WorkbookPage.tsx` — route `/workbook` — composes `widgets/topbar`,
  `widgets/workbook-toolbar`, `widgets/indent-grid`, `features/filter-indent`,
  `features/submit-indent`, `features/add-fert-line`, `features/export-indent`. Guarded by `RequireAuth`.

## widgets/
- `widgets/topbar/` — `ui/TopBar.tsx` — persistent nav + cycle/cutoff/status + user chip + theme +
  sign-out. Depends on `entities/session`, `entities/cycle`, `shared/ui`, `shared/lib`.
  Public API (`index.ts`): `TopBar`.
- `widgets/home-summary/` — `ui/IndentProgressCard.tsx`, `ui/VerticalsSummaryCard.tsx`,
  `ui/NeedsAttentionCard.tsx` — dealer's per-vertical progress/status block on Home. Depends on
  `entities/cycle`, `entities/indent-line`, `shared/ui`. Public API: `HomeSummary` (composed group).
- `widgets/plan-performance/` — `ui/IndentVsDemandCard.tsx`, `ui/StockAgingCard.tsx`,
  `ui/DemandMixCard.tsx`, `ui/AbpPlaceholderCard.tsx` — KPI cards derived client-side from indent-line
  data (no dedicated endpoints — see api-integration-points.md note). Depends on `entities/indent-line`,
  `shared/ui`, `shared/lib/format`. Public API: `PlanPerformance`.
- `widgets/accuracy-summary/` — `ui/IndentAccuracyCard.tsx`, `ui/AccuracyReportPanel.tsx` — depends
  on `entities/accuracy`, `entities/dealer` (outlet names for "by outlet" view). Public API:
  `AccuracySummary`, `AccuracyReportPanel`.
- `widgets/rollup/` — `ui/RollupTable.tsx` — group-by rollup of indent lines; group-by/expanded-rows
  are local component state (D27). Depends on `entities/indent-line`. Public API: `RollupTable`.
- `widgets/workbook-toolbar/` — `ui/WorkbookToolbar.tsx`, `ui/ColumnsPopover.tsx` — vertical
  selector, search, filter-token chips, add/export triggers, density + column-band controls (D19,
  D22 — local state). Depends on `entities/indent-line` (facet/result counts),
  `features/filter-indent` (token removal callbacks), `features/add-fert-line` (open-add trigger),
  `features/export-indent` (open-export trigger). Public API: `WorkbookToolbar`.
- `widgets/indent-grid/` — `ui/IndentGrid.tsx`, `ui/LineDetailDrawer.tsx` — the dense editable grid
  + line detail slide-over. Depends on `entities/indent-line`, `features/edit-indent-line`.
  Public API: `IndentGrid`, `LineDetailDrawer`.

## features/
- `features/auth-login/` — `ui/LoginForm.tsx`, `api/authApi.ts` (`login`), `model/` (form error →
  field mapping only; no slice — auth token/session lives in `entities/session`).
  Public API: `LoginForm`.
- `features/edit-indent-line/` — `ui/EditableQtyCell.tsx`, `api/editIndentApi.ts`
  (`updateDealerIndentCell`, `batchUpdateDealerIndentCells`) — single-cell edit, arrow-key nav,
  fill-down, paste. Depends on `entities/indent-line`. Public API: `EditableQtyCell`, edit hooks.
- `features/add-fert-line/` — `ui/AddFertModal.tsx`, `api/addFertApi.ts`
  (`listAvailableProducts`, `addDealerIndentLine`). Depends on `entities/indent-line` (invalidates
  its list). Public API: `AddFertModal`.
- `features/filter-indent/` — `ui/FilterRail.tsx`, `ui/MultiSelectFilter.tsx` — active filter
  selections (D18), search (D19), saved views (D20, `TBD` — no endpoint yet, see
  api-integration-points.md). All state is local/component-lifted (per AGENTS.md — "local UI state"
  items get no slice); `FilterRail` owns the `Record<FilterKey, Set<string>>` state and passes
  derived tokens down to `widgets/workbook-toolbar`. Depends on `entities/indent-line` (facet
  counts). Public API: `FilterRail`, `MultiSelectFilter`.
- `features/submit-indent/` — `ui/CommitBar.tsx`, `ui/ReviewSubmitModal.tsx`, `api/submitApi.ts`
  (`getDealerSubmitPreview`, `submitDealerIndent`, `reopenDealerIndent`). Depends on
  `entities/cycle` (status refresh), `entities/indent-line` (lock state). Public API: `CommitBar`,
  `ReviewSubmitModal`.
- `features/export-indent/` — `ui/ExportModal.tsx`, `lib/buildIndentCsv.ts` — client-side CSV
  transform of already-loaded entity data (D25 — `client global state`, not a fetch). Depends on
  `entities/indent-line`, `entities/dealer`, `entities/cycle`. Public API: `ExportModal`.

## entities/
- `entities/session/` — `model/sessionSlice.ts` (auth token, `authStatus`), `api/sessionApi.ts`
  (`getCurrentUser`). Public API: `sessionSlice`, `useGetCurrentUserQuery`, session selectors.
- `entities/cycle/` — `api/cycleApi.ts` (`getCurrentCyclePreview`, `getDealerCycleSummary`).
  Public API: cycle hooks + `CycleStatus` type re-export.
- `entities/dealer/` — `api/dealerApi.ts` (`listDealerOutlets`). Public API: `useListDealerOutletsQuery`.
- `entities/indent-line/` — `api/indentLineApi.ts` (`listDealerIndentLines`), `ui/` (none
  presentational yet — grid/cell ui lives in the widget/feature that edits it). Public API: indent
  line hooks + `IndentLine`/`ProductReference` type re-exports.
- `entities/accuracy/` — `api/accuracyApi.ts` (`getDealerAccuracyHistory`). Public API: accuracy hooks.

## shared/
- `shared/api/` — `baseApi.ts`, `errors.ts` (existing), `generated/**` (schema-parser-owned, existing)
- `shared/ui/` — `Button`, `Select`, `Input`, `Badge` (pill), `Modal` (dialog shell), `Toast`
- `shared/lib/` — `store/` (typed hooks), `logger/` (existing), `format/` (Intl number/date helpers
  for units, %, dates — `d Jul` style, cutoff countdown)
- `shared/config/` — `env.ts` (existing), `routes.ts` (extend: `signIn`, `home`, `workbook`)

## Excluded (not planned)
- **PersonaSwitcher** — `components.md` marks this explicitly as a prototype-only navigation
  control ("Persona switching lives here, not in the product chrome"), not part of the production
  component inventory. No slice assigned. See `component-owners.md` for the accounted-for row.

---

## Client FSD compliance

`inputs/fsd-spec.md` is a business/functional specification (personas, workflow, Phase 0/1 scope
boundary) — it does not define FSD layers, slice names, or a component inventory. There is no
layer-naming requirement from the client document to check against AGENTS.md §2; instead this table
maps the FSD's *business* scope onto what is/isn't planned here.

| Client doc section | Requirement | Where planned | Status |
|---|---|---|---|
| §2 Scope table — "Dealer screen" | FERT-level indent entry (M1 weekly, M2/M3 monthly), 3M/6M avg reference, prior cycle indent, auto-submit at cut-off (15th) | `widgets/indent-grid`, `features/submit-indent`, `entities/indent-line`, `entities/cycle` | as specified |
| §2 Scope table — "CSM/ASM screen", "RSM screen", "VH screen", "ISO screen", "Approval chain" (cross-tier), "COCO screens", "IB screen", "IS screen", "NPI screen" | Cluster/region/vertical/national moderation screens; COCO, IB, IS, NPI standalone workbenches | not planned — no `analysis/*` input for these screens (no UX file in `inputs/ux/` beyond `dealer.html`, confirmed by components.md's own note) | not planned (pending analysis input) |
| §3 Personas — data-level security ("Can only see and edit their own dealership's data... enforced at database level, not just UI") | Per-dealer row-level scoping | `entities/session` (identifies `dealerId`), all `entities/*Api.ts` path-param on `dealerId` from session, not client-chosen | as specified |
| §5 Indent Workflow — dealer step (submit, lock, cutoff, email alert) | Lock UI + auto-submit note (email alert is Phase 1 / backend-owned, no UI component) | `features/submit-indent`, `widgets/topbar` (status/cutoff) | as specified (UI parts only — email delivery is backend, out of FSD scope) |
| §2 "What is NOT in Phase 0" (system-recommended indent, alert engine, pipeline analytics, safety-stock norm, backlog mgmt) | These must NOT get components/endpoints planned | Confirmed absent from `analysis/*` and `endpoints-map.json` — none planned | as specified |

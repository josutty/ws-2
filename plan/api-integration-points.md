# API Integration Points — Demand Planning Workbench (Dealer persona, Phase 0)

Source: `plan/generated/endpoints-map.json` (14 operations: 6 proposed/mock, 8 real).

| operationId | Mock? | RTK Query endpoint | Type | Defined in | Tags provides / invalidates | Consumers | Error UX |
|---|---|---|---|---|---|---|---|
| login | mock | `login` | mutation | `features/auth-login/api/authApi.ts` | invalidates `Session` (forces `getCurrentUser` refetch) | `features/auth-login` (LoginForm) | inline field error — `unknown-identifier` on the id field, `wrong-password` (+ attempts-remaining) on the password field; network/`default` error → form-level banner `role="alert"` |
| getCurrentCyclePreview | mock | `getCurrentCyclePreview` | query | `entities/cycle/api/cycleApi.ts` | provides `CyclePreview` | `pages/sign-in` (pre-auth cycle banner) | non-critical — on error, hide the banner silently (no retry UI); login still works |
| getCurrentUser | real | `getCurrentUser` | query | `entities/session/api/sessionApi.ts` | provides `Session` | `app/providers` (`RequireAuth` gate), `widgets/topbar` (user chip), `pages/home` (greeting) | 401 → `sessionExpired` dispatch, redirect to `/sign-in` (AGENTS §12); other errors → full-page banner + retry |
| listDealerOutlets | mock | `listDealerOutlets` | query | `entities/dealer/api/dealerApi.ts` | provides `Outlet` LIST | `widgets/accuracy-summary` (AccuracyReportPanel "by outlet") | banner + retry inside the panel; empty → n/a (dealer always has ≥1 outlet) |
| getDealerCycleSummary | real | `getDealerCycleSummary` | query | `entities/cycle/api/cycleApi.ts` | provides `DealerCycleSummary` | `widgets/topbar` (status/cutoff), `widgets/home-summary` (IndentProgressCard, VerticalsSummaryCard, NeedsAttentionCard), `features/submit-indent` (CommitBar submitted state) | banner + retry (Home); TopBar shows last-known values + a retry affordance rather than blocking nav |
| listDealerIndentLines | real | `listDealerIndentLines` | query | `entities/indent-line/api/indentLineApi.ts` | provides `IndentLine` LIST (paginated) | `widgets/indent-grid`, `widgets/plan-performance`, `widgets/rollup`, `features/filter-indent` (facet counts), `features/export-indent` (CSV source) | banner + retry replacing the grid; empty → "No lines match these filters" panel (already in ui-states.md) |
| addDealerIndentLine | real | `addDealerIndentLine` | mutation | `features/add-fert-line/api/addFertApi.ts` | invalidates `IndentLine` LIST | `features/add-fert-line` (AddFertModal) | inline modal error banner; 409 → toast "already on your indent" + close modal |
| listAvailableProducts | mock | `listAvailableProducts` | query | `features/add-fert-line/api/addFertApi.ts` | provides `AvailableProduct` LIST | `features/add-fert-line` (AddFertModal catalogue search) | banner + retry inside the modal; empty/no-match → "No matching code in the catalogue." (already in ui-states.md) |
| updateDealerIndentCell | real | `updateDealerIndentCell` | mutation | `features/edit-indent-line/api/editIndentApi.ts` | invalidates `IndentLine` (by id); optimistic update on the cell | `widgets/indent-grid` (IndentGrid single-cell edit) | revert the optimistic value + inline toast on error; 409 (line locked/submitted) → toast + cell re-disabled |
| batchUpdateDealerIndentCells | real | `batchUpdateDealerIndentCells` | mutation | `features/edit-indent-line/api/editIndentApi.ts` | invalidates `IndentLine` LIST | `widgets/indent-grid` (multi-cell paste) | 207 partial failure → toast summarizing "`{n}` of `{total}` cells pasted, `{n}` failed"; full failure → toast + no cells change |
| getDealerAccuracyHistory | mock | `getDealerAccuracyHistory` | query | `entities/accuracy/api/accuracyApi.ts` | provides `AccuracyHistory` | `widgets/accuracy-summary` (IndentAccuracyCard, AccuracyReportPanel) | banner + retry within the card; empty (no history yet) → n/a for Phase 0 (dealer always has ≥4 cycles per FSD assumption) |
| getDealerSubmitPreview | real | `getDealerSubmitPreview` | query | `features/submit-indent/api/submitApi.ts` | provides `SubmitPreview` | `features/submit-indent` (ReviewSubmitModal) | banner + retry inside the modal; Submit button disabled until loaded |
| submitDealerIndent | real | `submitDealerIndent` | mutation | `features/submit-indent/api/submitApi.ts` | invalidates `DealerCycleSummary`, `IndentLine` LIST (locks the vertical) | `features/submit-indent` (ReviewSubmitModal "Submit indent") | inline modal error banner, modal stays open; 409 (already submitted/past cutoff) → banner + "Cancel" only |
| reopenDealerIndent | mock | `reopenDealerIndent` | mutation | `features/submit-indent/api/submitApi.ts` | invalidates `DealerCycleSummary`, `IndentLine` LIST | `features/submit-indent` (CommitBar "Reopen") | toast on error; 409 (past cutoff — reopen no longer allowed) → toast + button disabled |

## Client-state slices

| Slice | File | Fields | Consumers |
|---|---|---|---|
| session | `entities/session/model/sessionSlice.ts` | `token: string \| null`, `authStatus: 'anonymous' \| 'authenticated' \| 'expired'` | `app/providers` (`RequireAuth`), `widgets/topbar`, `features/auth-login` |

No other slice is needed. All remaining dataflow items (D18–D27 — active filters, search query,
sort, column/density/rail state, drawer/modal open state, rollup group-by) are classified
`local UI state` in `analysis/dataflow.md` and per AGENTS.md stay in the owning component
(`features/filter-indent/ui/FilterRail.tsx` lifts D18/D19 for its siblings; `widgets/indent-grid`
owns D21/D23; `widgets/workbook-toolbar` owns D22; `widgets/rollup` owns D27) — no slice files.

## Notes / open items carried forward from analysis

- **D20 saved filter views** — classified `TBD` in dataflow.md; `backend-gaps.md` confirms no
  endpoint is proposed pending a business decision on server vs session-only persistence. Not
  wired to any RTK Query endpoint here. Revisit once `notes/research/api-schema.md` or a human
  decision resolves it.
- **D25 export CSV** — not a fetch; `features/export-indent/lib/buildIndentCsv.ts` is a typed
  selector over already-loaded `entities/indent-line` + `entities/dealer` + `entities/cycle` data
  (per AGENTS.md's own guidance to keep this "still... a typed selector, not ad-hoc string
  building").
- **`widgets/plan-performance` cards (IndentVsDemandCard, StockAgingCard, DemandMixCard)** — no
  dedicated aggregate endpoint exists in `endpoints-map.json`; these are planned as client-side
  aggregations over `listDealerIndentLines` data already loaded for the grid. If usage data
  volume makes this too slow, revisit with store-architect/hybrid-api-config for a dedicated
  summary endpoint.
- **D26 theme preference** — no server persistence; local-only via `app/providers` `ThemeProvider`
  (`localStorage` + `prefers-color-scheme` fallback), not an entity/feature slice.
- **D28 persona selection** — prototype-only per components.md; no endpoint, no slice, excluded
  from `component-owners.md`.

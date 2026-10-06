# Backend gaps — generated 2026-09-30

Source: merged `inputs/api/backend-api.yaml` (8 real operations, verbatim, `x-mock: false`)
against `analysis/dataflow.md` data needs (D1–D28) and `analysis/components.md`. Result:
`plan/generated/api-spec.yaml` — 8 real + 8 proposed operations.

## Proposed endpoints (mocked until built)

| Method | Path | operationId | Needed by | Schema |
|---|---|---|---|---|
| POST | `/auth/login` | `login` | LoginForm (D17) | `LoginRequest` → `LoginResult` |
| GET | `/cycles/current` | `getCurrentCyclePreview` | LoginForm pre-auth cycle banner (D15) | `CurrentCyclePreview` |
| GET | `/dealers/{dealerId}/outlets` | `listDealerOutlets` | AccuracyReportPanel "By outlet" (D12) | `OutletList` |
| GET | `/dealers/{dealerId}/catalogue/available-products` | `listAvailableProducts` | AddFertModal (D13) | `AvailableProductPage` (reuses `ProductReference`) |
| GET | `/dealers/{dealerId}/accuracy-history` | `getDealerAccuracyHistory` | IndentAccuracyCard, AccuracyReportPanel (D11) | `AccuracyHistoryResponse` |
| POST | `/dealers/{dealerId}/cycles/{cycleId}/reopen` | `reopenDealerIndent` | CommitBar "Reopen" (D5) | reuses `SubmitRequest` → `ReopenResult` |

All six are `x-mock: true, x-proposed: true` and follow the backend's own path prefix,
pagination envelope (`page/size/totalElements/items`), and `Error` schema. `login` and
`getCurrentCyclePreview` override `security: []` since they must work before a bearer token exists.

## Missing params on real endpoints

| Endpoint | Param | Needed by |
|---|---|---|
| `listDealerIndentLines` | `vertical` | WorkbookToolbar (LMD/HD selector), FilterRail |
| `listDealerIndentLines` | `subVertical` | FilterRail |
| `listDealerIndentLines` | `demandSegment` | FilterRail (dealer's own Runner/Repeater/Stranger — see schema gap below) |
| `listDealerIndentLines` | `mpg` | FilterRail |
| `listDealerIndentLines` | `tonnage` | FilterRail |
| `listDealerIndentLines` | `fuel` | FilterRail |
| `listDealerIndentLines` | `acType` | FilterRail (Cabin filter) |
| `listDealerIndentLines` | `fertHistoryRange` | FilterRail ("FERT History" filter — semantics unclear, see Open questions) |
| `listDealerIndentLines` | `statusFlag` | NeedsAttentionCard / FilterRail Status filter (no-entry, aged180, delta-vs-last-cycle, added-by-me) |

Per convention, these are **not** added to the operation's parameters — `x-backend-gaps` on the
operation in api-spec.yaml carries the same list for schema-parser/MSW.

## Missing fields on real schemas

| Schema | Field | Needed by |
|---|---|---|
| `ProductReference` | `vertical` (LMD/HD) | WorkbookToolbar, FilterRail, RollupTable group-by |
| `ProductReference` | `demandSegment` (dealer's own Runner/Repeater/Stranger, distinct from `eicherSegment`) | IndentGrid segment-mismatch display (D1), FilterRail |
| `CurrentUser` / `DealerCycleSummary.dealer` | `verticals` (list covered by this dealer) | HomeDashboard greeting, TopBar (D16) |
| `CurrentUser` / `DealerCycleSummary.dealer` | outlet count / region | HomeDashboard greeting (D16) |
| `DealerCycleSummary` | per-vertical `status` breakdown (today: one `status` per cycle) | VerticalsSummaryCard, TopBar (D3) |
| `SubmitRequest` / `SubmitPreview` | explicit `vertical` | ReviewSubmitModal, CommitBar (D4) — may be moot if `taskId` already scopes one vertical; see Open questions |

## Spec quality (informational — from `npx @redocly/cli lint` without `--extends=minimal`)

- `info` object has no `license` field (pre-existing in the backend's own spec — not changed).
- Backend's own `servers[0].url` points to `api.vecvplan.example.com`, flagged by
  `no-server-example.com` (pre-existing, left verbatim per rule 1).
- 9 operations (1 real: `getCurrentUser`, `getDealerCycleSummary`, `listDealerIndentLines`,
  `batchUpdateDealerIndentCells`, `getDealerSubmitPreview`; 5 proposed) have no documented `4XX`
  response beyond the shared `default` → `Error`. Left as-is: the backend's own real operations
  already follow this pattern (only `addDealerIndentLine`, `updateDealerIndentCell`,
  `submitDealerIndent` document an explicit `409`), so proposed operations mirror it for
  consistency rather than inventing stricter contracts the backend hasn't stated.

## Open questions

- **Vertical scoping of workflow tasks**: does `taskId` (used in `IndentCellUpdate`,
  `SubmitRequest`) already scope to one vertical (LMD or HD), i.e. is there a separate task per
  vertical per cycle? If yes, several gaps above (per-vertical status, explicit `vertical` on
  submit) may already be resolved by looking up the task, not by a schema change. If no, the
  backend needs an explicit `vertical` dimension somewhere in the cycle/task model.
- **SSO sign-in**: LoginForm's "Sign in with VECVNet SSO" button is wired to the same handler as
  password login in the prototype (per components.md). A real SSO flow is normally an OAuth/OIDC
  redirect, not a JSON POST — not modeled as an endpoint here; needs a decision from the backend/
  identity team on the actual flow before a TASK is planned against it.
- **Pre-auth cycle preview**: is `GET /cycles/current` (proposed) intended to be genuinely public,
  or should the login screen instead show cached/static copy with no live API call? Flagging
  before schema-parser/mock-data-generator build against it.
- **"FERT History" filter**: dataflow.md and components.md don't define what range this filters
  (e.g. time since first stocked, time since last ordered). Needs a definition before
  `fertHistoryRange` can be specified precisely.
- **Status filter flags**: `noentry`, `aged180`, `addedByMe`, and "±20% off last cycle" combine
  data already present in `IndentLine` (stock breakdown, `periods`, `lastCycle`) plus one boolean
  we don't have yet (`addedByMe`/`isAdd` flag on the line). Confirm whether these should be:
  (a) server-side `statusFlag` query params for correctness across pages, or (b) purely
  client-side filters over an already-loaded page (simpler, but breaks pagination totals/counts
  shown by NeedsAttentionCard). `AddIndentLineRequest`/`IndentLine` also currently has no
  `addedByMe`/`isAdd` flag in the response — needed either way.
- **Saved filter views (D20)**: unclear if these persist server-side per user/device, or are
  session-only (echoes wireframe-analyzer's own open question). No endpoint proposed pending an
  answer — classified `TBD` in dataflow.md, so per rule 5 it produces no operation yet.
- **Reopen as a business rule (D5)**: the FSD doesn't explicitly document a dealer-initiated
  "reopen before cutoff" — dataflow.md flags this as possibly UX-only. Proposed endpoint
  `reopenDealerIndent` is included so the UI has something to call, but should be confirmed against
  actual workflow rules (e.g. does reopening require ASM approval instead of being self-service?).

# API schema — generated 2026-09-30

Source: `plan/generated/api-spec.yaml` (hybrid-api-config's merged spec — 8 real operations
verbatim from `inputs/api/backend-api.yaml`, 6 proposed operations marked `x-mock: true`).
Outputs: `src/shared/api/generated/schema.d.ts` (openapi-typescript, do not hand-edit),
`src/shared/api/generated/models.ts` (hand-written aliases), `plan/generated/endpoints-map.json`.

Validation: `npx @redocly/cli lint --extends=minimal` — 0 errors. `npx tsc --noEmit --strict
--skipLibCheck src/shared/api/generated/models.ts` — 0 errors.

## Servers, auth, envelopes

- Base URL: `https://api.vecvplan.example.com/api/v1` (flagged by redocly's
  `no-server-example.com` rule — pre-existing in the backend's own spec, left verbatim).
- Auth: `bearerAuth` (HTTP bearer, JWT) via the `Authorization` header, applied globally except
  on `login` and `getCurrentCyclePreview` (both override `security: []` since they run before a
  token exists).
- Pagination envelope: `{ page, size, totalElements, items }` on `IndentLinePage` and
  `AvailableProductPage`. `OutletList` is a plain `{ items }` array wrapper with no pagination
  fields — inconsistent with the other two list responses; not "fixed" here since the spec
  doesn't document it as paginated.
- Error shape: `Error` schema — `{ errorCode, category, retryable, message, requestId,
  fieldErrors? }`, returned as `default` on every operation and as an explicit typed response on
  the ones with documented 4xx (`login` 401, `addDealerIndentLine` 409, `updateDealerIndentCell`
  409, `submitDealerIndent` 409, `reopenDealerIndent` 409).

## Operations (14 total — 8 real, 6 mock/proposed)

| operationId | Method | Path | Real/Mock | Response model |
|---|---|---|---|---|
| `login` | POST | `/auth/login` | mock | `LoginResponse` |
| `getCurrentCyclePreview` | GET | `/cycles/current` | mock | `GetCurrentCyclePreviewResponse` |
| `getCurrentUser` | GET | `/users/me` | real | `GetCurrentUserResponse` |
| `listDealerOutlets` | GET | `/dealers/{dealerId}/outlets` | mock | `ListDealerOutletsResponse` |
| `getDealerCycleSummary` | GET | `/dealers/{dealerId}/cycles/{cycleId}/summary` | real | `GetDealerCycleSummaryResponse` |
| `listDealerIndentLines` | GET | `/dealers/{dealerId}/cycles/{cycleId}/indent-lines` | real | `ListDealerIndentLinesResponse` |
| `addDealerIndentLine` | POST | `/dealers/{dealerId}/cycles/{cycleId}/indent-lines` | real | `AddDealerIndentLineResponse` |
| `listAvailableProducts` | GET | `/dealers/{dealerId}/catalogue/available-products` | mock | `ListAvailableProductsResponse` |
| `updateDealerIndentCell` | PUT | `/dealers/{dealerId}/cycles/{cycleId}/indent-lines/{lineId}` | real | `UpdateDealerIndentCellResponse` |
| `batchUpdateDealerIndentCells` | PUT | `/dealers/{dealerId}/cycles/{cycleId}/indent-lines/batch` | real | `BatchUpdateDealerIndentCellsResponse` |
| `getDealerAccuracyHistory` | GET | `/dealers/{dealerId}/accuracy-history` | mock | `GetDealerAccuracyHistoryResponse` |
| `getDealerSubmitPreview` | GET | `/dealers/{dealerId}/cycles/{cycleId}/submit-preview` | real | `GetDealerSubmitPreviewResponse` |
| `submitDealerIndent` | POST | `/dealers/{dealerId}/cycles/{cycleId}/submit` | real | `SubmitDealerIndentResponse` |
| `reopenDealerIndent` | POST | `/dealers/{dealerId}/cycles/{cycleId}/reopen` | mock | `ReopenDealerIndentResponse` |

## Vague or notable spots (generated type stays vague — documented, not patched)

- **`addDealerIndentLine` inherits pagination/search/filter query params** (`page`, `size`,
  `sort`, `search`, `includeReference`, `collapsedGroups`) from the shared OpenAPI path item
  `/dealers/{dealerId}/cycles/{cycleId}/indent-lines`, which defines those params once for both
  the `GET` (list) and `POST` (add) operations. This is spec-legal (path-level parameters apply
  to every operation on that path) but not semantically meaningful for the POST. `schema.d.ts`
  and `endpoints-map.json` both carry it verbatim; RTK Query's `addDealerIndentLine` mutation
  should simply ignore the inherited query fields rather than the spec being edited here.
- **`OutletList` has no pagination envelope** (just `{ items: Outlet[] }`) while
  `IndentLinePage`/`AvailableProductPage` do. Left as-is — `listDealerOutlets` is a proposed
  endpoint and the FSD doc doesn't say outlets need paging.
- **`listAvailableProducts.vertical` and `collapsedGroups` items are typed as plain `string`**,
  not enums, even though the dealer workbook only ever uses `LMD`/`HD` (vertical) and
  `pipeline` (collapsedGroups' one supported value per its own description) — the spec itself
  only constrains `collapsedGroups` items to the `pipeline` enum, so `vertical` stays `string`
  per the actual schema.
- **Nine operations document no 4xx beyond `default: Error`** (`getCurrentCyclePreview`,
  `getCurrentUser`, `listDealerOutlets`, `getDealerCycleSummary`, `listDealerIndentLines`,
  `listAvailableProducts`, `batchUpdateDealerIndentCells` (207 is a partial-success, not an
  error), `getDealerAccuracyHistory`, `getDealerSubmitPreview`) — carried through unchanged;
  callers should treat `default` as the catch-all error path for these.
- **Missing filter query params on `listDealerIndentLines`** (`vertical`, `subVertical`,
  `demandSegment`, `mpg`, `tonnage`, `fuel`, `acType`, `fertHistoryRange`, `statusFlag`) are
  listed under `x-backend-gaps` in the spec and carried into `endpoints-map.json`'s
  `backendGaps` array for this operation — no query parameter exists for them in
  `schema.d.ts`/`operations['listDealerIndentLines']['parameters']['query']`.
- **Missing fields on real schemas** (`ProductReference.vertical`, `ProductReference` dealer-own
  `demandSegment` distinct from `eicherSegment`, `CurrentUser`/`DealerReference.verticals` and
  outlet count/region, per-vertical `status` on `DealerCycleSummary`, explicit `vertical` on
  `SubmitRequest`/`SubmitPreview`) are absent from `schema.d.ts` because they're absent from the
  spec — see `plan/generated/backend-gaps.md` for the full rationale; carried into this
  operation's `backendGaps` entry in `endpoints-map.json` where applicable.
- **Open business-rule questions** (SSO flow, pre-auth cycle preview publicness, "FERT History"
  filter semantics, status-flag server vs. client filtering, saved filter persistence, whether
  `reopenDealerIndent` is a real business rule) are unresolved in the spec itself — see
  `plan/generated/backend-gaps.md` "Open questions". They don't change the generated types; they
  gate whether the mock endpoints should be built as specified.

## Models file

`src/shared/api/generated/models.ts` exports one alias block per tag (Identity, Dealer profile,
Dealer indent, Submission, Accuracy) plus a final `errors` block. Every exported name is either a
component schema referenced (directly or via nested fields) by at least one operation, an
operation's query-params type (`NonNullable<operations[...]['parameters']['query']>`), or an
operation's success response body (`Json<operations[...]['responses'][code]>`). No field was
invented or renamed from the spec.

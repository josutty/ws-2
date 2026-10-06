# Store design — Demand Planning Workbench (Dealer persona, Phase 0)

Built by store-architect, Phase 3a. Every TASK agent (coder) should consume the hooks/selectors
below rather than guessing signatures or re-deriving cache tags.

## Path-param convention (read this first)

All authenticated, dealer-scoped endpoints are written with **literal placeholders** in their
`query`'s `url` string: `:dealerId` and `:cycleId`. These are substituted centrally inside
`src/shared/api/baseApi.ts`'s wrapping `baseQuery` — **no entity/feature file resolves them
itself**, so none of them need to import `entities/session` (which the FSD import matrix forbids
for same-layer/cross-entity access).

- `:dealerId` → read from `session.dealerId` in the Redux store (duck-typed in `baseApi.ts`, the
  same trick already used for the auth token in `prepareHeaders` — shared/ never imports
  `RootState`). Populated by `entities/session`'s `sessionSlice` on `signedIn` / `getCurrentUser`
  fulfillment.
- `:cycleId` → always resolves to the literal string `"current"`. **No dealer-scoped "current
  cycle id" endpoint exists** in `endpoints-map.json` (`getDealerCycleSummary` et al. require a
  `cycleId` path param, but nothing before it ever returns one — `getCurrentCyclePreview` is
  pre-auth and has no `cycleId` field, `getCurrentUser` doesn't either). Since Phase 0 is
  single-cycle-per-dealer, this mirrors `GET /cycles/current`'s own unauthenticated "current"
  convention and works against every mock handler (MSW matches `:cycleId` by param *name*, not
  value). **Flagging for human/architect attention**: if a real (non-mock) backend requires an
  actual cycle UUID rather than accepting the literal `"current"`, this needs a dedicated
  "get current cycle id for this dealer" endpoint added to the spec — not blocking Phase 3a, but
  will need a revisit before go-live on the real endpoints.

Because of this, hooks for dealer/cycle-scoped endpoints take **only their real filter/body
params** — never `dealerId`/`cycleId` — exactly matching every TASK's "Integration contract"
wording (e.g. `useListDealerIndentLinesQuery({ vertical, search, sort })`, not
`useListDealerIndentLinesQuery({ dealerId, cycleId, ... })`).

## `login` and session-expiry

`baseApi.ts`'s wrapper dispatches `sessionExpired` (from `shared/api/events.ts`) on **any** 401
response **except** the `login` endpoint itself — `login`'s own 401s are bad-credentials errors
(`ERR_UNKNOWN_IDENTIFIER` / `ERR_WRONG_PASSWORD`), not an expired session, and must not reset
`authStatus` while the user is still on `/sign-in`.

## Endpoints

| operationId | Hook | File | Tag provides | Tag invalidates |
|---|---|---|---|---|
| `login` | `useLoginMutation` | `features/auth-login/api/authApi.ts` | — | `Session` (via `onQueryStarted` dispatching `signedIn`, then RTK Query's own `getCurrentUser` refetch) |
| `getCurrentCyclePreview` | `useGetCurrentCyclePreviewQuery({})` | `entities/cycle/api/cycleApi.ts` | `CyclePreview` | — |
| `getCurrentUser` | `useGetCurrentUserQuery({})` | `entities/session/api/sessionApi.ts` | `Session` | — |
| `listDealerOutlets` | `useListDealerOutletsQuery({})` | `entities/dealer/api/dealerApi.ts` | `Outlet` (`LIST` + per-`outletId`) | — |
| `getDealerCycleSummary` | `useGetDealerCycleSummaryQuery({})` | `entities/cycle/api/cycleApi.ts` | `DealerCycleSummary` | — |
| `listDealerIndentLines` | `useListDealerIndentLinesQuery(params)` | `entities/indent-line/api/indentLineApi.ts` | `IndentLine` (`LIST` + per-`lineId`) | — |
| `addDealerIndentLine` | `useAddDealerIndentLineMutation` | `features/add-fert-line/api/addFertApi.ts` | — | `{ type: 'IndentLine', id: 'LIST' }` |
| `listAvailableProducts` | `useListAvailableProductsQuery(params)` | `features/add-fert-line/api/addFertApi.ts` | `{ type: 'AvailableProduct', id: 'LIST' }` | — |
| `updateDealerIndentCell` | `useUpdateDealerIndentCellMutation({ lineId, body })` | `features/edit-indent-line/api/editIndentApi.ts` | — | `{ type: 'IndentLine', id: lineId }`; optimistic patch of every cached `listDealerIndentLines` result via `onQueryStarted` + `updateQueryData`, reverted on failure |
| `batchUpdateDealerIndentCells` | `useBatchUpdateDealerIndentCellsMutation(body)` | `features/edit-indent-line/api/editIndentApi.ts` | — | `{ type: 'IndentLine', id: 'LIST' }` (on 200 or 207 — partial-failure toast wiring is the consuming widget's job) |
| `getDealerAccuracyHistory` | `useGetDealerAccuracyHistoryQuery({ groupBy, cycles? })` | `entities/accuracy/api/accuracyApi.ts` | `AccuracyHistory` | — |
| `getDealerSubmitPreview` | `useGetDealerSubmitPreviewQuery({})` | `features/submit-indent/api/submitApi.ts` | `SubmitPreview` | — |
| `submitDealerIndent` | `useSubmitDealerIndentMutation(body)` | `features/submit-indent/api/submitApi.ts` | — | `DealerCycleSummary`, `{ type: 'IndentLine', id: 'LIST' }` |
| `reopenDealerIndent` | `useReopenDealerIndentMutation(body)` | `features/submit-indent/api/submitApi.ts` | — | `DealerCycleSummary`, `{ type: 'IndentLine', id: 'LIST' }` |

Endpoints typed with an all-optional (or, for `getCurrentUser`/`getCurrentCyclePreview`/
`listDealerOutlets`/`getDealerCycleSummary`/`getDealerSubmitPreview`, a fully-empty)
params object — call with `{}`, never `void` (the strict lint config's
`no-invalid-void-type` rejects `void` as a generic argument here; AGENTS.md §3 says the same).

Request/response bodies are never redefined — every `query`/mutation body type is imported
verbatim from `src/shared/api/generated/models.ts` (`LoginRequest`, `IndentCellUpdate`,
`IndentBatchUpdate`, `SubmitRequest`, `AddIndentLineRequest`, …).

## Slices

| Slice | File | Fields | Selectors | Actions |
|---|---|---|---|---|
| `session` | `entities/session/model/sessionSlice.ts` | `token: string \| null`, `dealerId: string \| null`, `authStatus: 'anonymous' \| 'authenticated' \| 'expired'` | `sessionSlice.selectors.selectToken`, `.selectDealerId`, `.selectAuthStatus`, `.selectIsAuthenticated` | `signedIn({ token, dealerId })`, `signedOut()` |

- `dealerId` is not just documentation — it's read by `baseApi.ts`'s `:dealerId` path
  substitution (see above), so it must be populated before any dealer-scoped query can resolve a
  real URL. It's set two ways: (1) `features/auth-login/api/authApi.ts`'s `login` mutation
  dispatches `signedIn({ token, dealerId })` from its own `onQueryStarted` on success — the
  `LoginForm` component itself never dispatches session state, matching TASK-002's contract; (2)
  `sessionSlice`'s own `extraReducers` also syncs `dealerId`/`authStatus` whenever
  `sessionApi`'s `getCurrentUser` fulfills (covers a hard reload once a real backend persists the
  token).
- `sessionExpired` (from `shared/api/events.ts`) resets the slice to its initial state with
  `authStatus: 'expired'` — dispatched centrally by `baseApi.ts` on any 401 other than `login`'s
  own. `app/providers`' `RequireAuth` (app-bootstrap, not built yet) should read
  `selectAuthStatus` to redirect to `/sign-in`.
- No other slice exists. Every other dataflow item (D18–D27) is local component/UI state per
  `api-integration-points.md` and stays out of the store — do not add slices for filters, sort,
  density, drawer state, etc.

## Store root

- `src/app/store/index.ts` — `combineSlices(baseApi, sessionSlice)`, `makeStore(preloadedState?)`,
  `store` (the app's singleton). `makeStore` takes `preloadedState` so tests get a fresh store per
  render (`@test/test-utils`'s `renderWithProviders`, not built by this TASK).
- `src/app/store/middleware.ts` — `rejectionLogger`, logs any `isRejectedWithValue` action via
  `shared/lib/logger`.
- `src/app/store/types.d.ts` — declares the **global** `RootState`/`AppStore`/`AppDispatch` types
  (no import needed anywhere below `app/`).
- `src/shared/lib/store/hooks.ts` — `useAppDispatch`, `useAppSelector` (typed via the global types
  above).

## Gaps carried forward (not blocking, not this TASK's job)

- **G5** — no TASK yet plans `pages/sign-in`; `LoginForm` (TASK-002) has nowhere to be hosted yet.
- **G6** — `shared/lib/format` has no owning TASK; TASK-008/TASK-010 will need it and it doesn't
  exist. Not created here (out of scope for store-architect).
- **cycleId sentinel** (this file, above) — revisit once/if a real backend needs a genuine cycle
  UUID instead of the literal `"current"`.

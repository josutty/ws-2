start-sha: 515fb09c0265ec2236f62c91c48118db55d657f4

## test-engineer — RED tests

Wrote `src/features/auth-login/ui/LoginForm.test.tsx` (connected component, `renderWithProviders`
+ `@mocks/node` MSW server). Covers the six UI states from TASK-002.md: default, submit-success
(clears loading), invalid-unknown-identifier, invalid-wrong-password, submitting
(button disabled/loading while in flight, ad-hoc `delay('infinite')` handler — no named scenario
exists for a slow login), error (`scenarios.loginServerError` → `role="alert"` banner), and
cycle-banner-error (`scenarios.cyclePreviewServerError` → banner text absent, form still usable).

### RED proof (`npx vitest run src/features/auth-login`)

Whole suite fails to collect for one reason, all 7 tests:
- RED because: `Failed to resolve import "./LoginForm" from "src/features/auth-login/ui/LoginForm.test.tsx". Does the file exist?`

`LoginForm.tsx` is listed `new` in TASK-002's Files table and does not exist yet — valid RED per
AGENTS.md §5, no setup crash.

### Lint

`npm run lint` — 0 ESLint errors/warnings on `LoginForm.test.tsx`. The run's overall exit is 1 from
pre-existing Steiger FSD findings on other agents' files (`src/app/providers`, various
entities/features slices with no references yet) — out of scope here.

## coder — implementation (GREEN)

Implemented `src/features/auth-login/ui/LoginForm.tsx` (react-hook-form `Controller` wrapping the
shared `Input`/`Button`, `zodResolver`) and extended `src/features/auth-login/index.ts` to export
`LoginForm`. Also added `src/features/auth-login/lib/loginSchema.ts` (zod schema for
`identifier`/`password`) — not in TASK-002's original Files table, added per the TASK's own text
("if the schema file doesn't exist yet, add it as a new row... owner coder") since `lib/**` is
coder-owned here; not committing any change to `plan/tasks/TASK-002.md` itself (architect-owned
per AGENTS.md §11).

- `useLoginMutation` (feature-owned hook) for the sign-in mutation; `useGetCurrentCyclePreviewQuery({})`
  (`@entities/cycle` public API) for the pre-auth cycle banner — hidden silently on error (no
  `isError` branch renders anything).
- Error mapping on `login(...).unwrap()` rejection: `ERR_UNKNOWN_IDENTIFIER` → `setError('identifier', …)`;
  `ERR_WRONG_PASSWORD` → `setError('password', …)`; anything else → `setError('root', …)` rendered as
  a `role="alert"` banner. No `useState` copy of server errors — all routed through react-hook-form's
  own `formState.errors`.
- SSO button and "Forgot password?" are stub handlers that set a local toast message (no real flow,
  per TASK-002.md and api-schema.md open questions).

### GREEN proof

```
npx vitest run src/features/auth-login
```
1 test file, 7 passed, 0 failed.

```
npm run typecheck
```
0 errors.

```
npm test
```
7 files, 29 tests, all passed.

```
npm run lint
```
Exit 1 — but unchanged from the pre-existing state: 1 Steiger error on `src/app/providers`
(not my file) and 8 "insignificant slice" warnings across `entities/*`/`features/*` (incl.
`features/auth-login`, which has no consumer page yet — `plan/coverage-matrix.md` G5 notes no
sign-in page TASK exists in the 16-TASK plan). 0 ESLint errors/warnings on any file I touched.

`git diff --name-only 515fb09` plus untracked files, filtered to my own paths: only
`src/features/auth-login/index.ts`, `src/features/auth-login/ui/LoginForm.tsx`,
`src/features/auth-login/lib/loginSchema.ts`, `plan/history/TASK-002.md` — within/consistent with
TASK-002's Files table (plus the TASK-permitted `lib/` addition).

## reviewer — verification

- Scope: `git diff --name-only 515fb09..HEAD` = `plan/PROGRESS.md`, `plan/history/TASK-002.md`,
  `src/features/auth-login/{index.ts,lib/loginSchema.ts,ui/LoginForm.test.tsx,ui/LoginForm.tsx}` —
  all ⊆ TASK-002's Files table (+ the TASK-permitted `lib/loginSchema.ts` row + history/progress).
  Branch `feat/shop-v1`, not base. Authorship confirmed: `6a6d8bf TASK-002(test-engineer)` owns the
  test + PROGRESS status bump, `ec7add2 TASK-002(coder)` owns `LoginForm.tsx`, `index.ts`,
  `loginSchema.ts`.
- Gates: `npm run typecheck` — 0 errors. `npm run lint` — exit 1, but the 1 error
  (`src/app/providers`, app-bootstrap-owned) and 8 `insignificant-slice` warnings (incl.
  `features/auth-login`, no consumer page yet) are unchanged pre-existing findings, none on any
  TASK-002 file — matches the baseline confirmed in TASK-001's reviewer pass. `npx vitest run
  src/features/auth-login` — 1 file, 7/7 passed, covering all six UI-states rows.
- Backup static checks (scoped to `src/features/auth-login/{index.ts,lib,ui}`): no `style=`, no
  hex/rgba literals, no raw Tailwind palette classes, no `fetch`/`axios`/`baseApi`, no `console.*`,
  no `@app` import, no `.skip/.only/.todo`, no SSN/card-like literals. (`baseApi` only appears in
  `api/authApi.ts`, store-architect-owned and untouched by this TASK — expected.)
- Error-mapping contract verified against `shared/api/errors.ts` + `mocks/handlers/identity.ts`:
  `ERR_UNKNOWN_IDENTIFIER` → `setError('identifier', …)`, `ERR_WRONG_PASSWORD` →
  `setError('password', …)` (message includes attempts-remaining from the body), any other code →
  `setError('root', …)` rendered as `role="alert"`; `getCurrentCyclePreview` failure renders
  nothing (no `isError` branch) — no retry UI, form stays usable. All backed by passing tests.
- react-hook-form + zod: `useForm` with `zodResolver(loginSchema)`, `Controller` wraps the shared
  `Input`; no `useState` copy of server errors (`formState.errors` only; `stubMessage` is UI-only
  toast state, not server data).
- AGENTS.md §12 Forms: both fields have a visible `<label htmlFor>` (via `Input`); `aria-invalid` +
  `aria-describedby` wired to the error `<span>` (confirmed in `shared/ui/Input.tsx`); `autoComplete`
  set (`username` / `current-password`); `<form noValidate>`; submit button `disabled={isLoading}`
  while the mutation is in flight (test-verified).
- P2 (CONCERNS, not blocking): the submit button is disabled while submitting but shows no visual
  loading indicator (spinner/text swap) — the shared `Button` (TASK-001/component-generator-owned,
  out of this TASK's file scope) has no `loading` prop at all, so "disabled-only" is the most this
  TASK's files can express. Not a coder-introduced regression; worth a `Button` enhancement in a
  future TASK if AGENTS.md §12's "shows loading" wording is meant literally.
- No other P0/P1 found: props match, all six UI-states rows rendered and tested, no business logic
  in the component beyond the allowed mapping, no teardown needed (RTK Query hooks auto-unsubscribe,
  confirmed no manual listeners/timers/AbortControllers).

Verdict: **CONCERNS** (one P2, shared-`Button` loading-indicator gap, out of this TASK's scope).
`plan/PROGRESS.md` TASK-002 status set to `done`.

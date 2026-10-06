---
id: TASK-002
status: open
revision: 1
depends-on: [TASK-001]
created: 2026-10-01
---

# TASK-002: features/auth-login — LoginForm

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/features/auth-login/ui/LoginForm.tsx | connected | coder | new |
| src/features/auth-login/index.ts | public api | coder | new |
| src/features/auth-login/ui/LoginForm.test.tsx | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: `useLoginMutation` (`features/auth-login/api/authApi.ts` — store-architect-owned,
  Phase 3a; this TASK only imports the generated hook), `useGetCurrentCyclePreviewQuery`
  (`entities/cycle`) for the pre-auth cycle banner.
- Client state: none (no slice — form field-error mapping is local component state per
  fsd-structure.md).
- Mutations: `login` — on success, RTK Query's own cache update triggers `getCurrentUser` refetch
  (invalidates `Session` tag, per api-integration-points.md); this component does not dispatch
  session state itself.
- Errors: `unknown-identifier` → inline error on the identifier field (`Input`'s `error` prop);
  `wrong-password` → inline error on the password field (message includes attempts-remaining from
  the error body); network/`default` error → form-level banner `role="alert"`. `getCurrentCyclePreview`
  failure is non-critical — hide the banner silently, no retry UI, login still works (per
  api-integration-points.md).
- No fetch/axios/useState for server data (AGENTS.md §3) — server errors read from the mutation
  hook's `error`, not copied into local state.

## Components

### LoginForm (connected)
- Props: none (page-level form, reads/writes only via hooks) — internal fields: identifier,
  password (react-hook-form + zod, schema in `features/auth-login/lib/loginSchema.ts` — **not**
  listed in this TASK's Files table; if the schema file doesn't exist yet, add it as a `new` row
  before implementing, owner coder, since AGENTS.md §11 assigns `lib/**` to "the owner named in
  the TASK Files table").
- Shows: title, instruction text, identifier + password fields, inline field errors, primary
  "Sign in" button, secondary "Sign in with VECVNet SSO" button (Q5/SSO flow unconfirmed per
  api-schema.md open questions — button present but its handler is a stub `onSsoSignIn` that shows
  a "not available in this build" toast, not a real SSO integration), "Forgot password?" link
  (stub toast, no flow — matches source UX, components.md confirms no real flow built),
  support-contact footnote, current cycle name/countdown banner.
- A11y: `<label htmlFor>` on both fields (via shared `Input`); errors wired to `aria-invalid` +
  `aria-describedby` (fixes components.md's noted gap); "Sign in with VECVNet SSO" and "Forgot
  password?" are real `<button>`/`<a>`, not icon-only.
- Responsive: single column, centered card, `max-width:400px` per design-tokens.md.

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| default | LoginForm | empty fields, no errors |
| invalid-unknown-identifier | LoginForm | identifier field shows "We don't recognise that dealer code." |
| invalid-wrong-password | LoginForm | password field shows "Incorrect password. `{n}` attempts left before the account locks." |
| submitting | LoginForm | Sign in button `loading`/disabled (AGENTS.md §12 Forms — not drawn in source UX, added per standard) |
| error (network/default) | LoginForm | form-level banner `role="alert"` |
| cycle banner error | LoginForm | banner hidden silently, form still usable |

## Tests (test-engineer writes RED first)
- LoginForm.test.tsx: renders both fields with labels; submit with valid input calls `login`
  mutation; `scenarios.loginUnknownIdentifier` (MSW) → identifier field shows its error;
  `scenarios.loginWrongPassword` → password field shows its error; `scenarios.loginServerError` →
  form-level `role="alert"` banner; `scenarios.cyclePreviewServerError` → banner section absent,
  form still renders and is submittable; submit button disabled + shows loading while the mutation
  is in flight.
- Coverage target: 80% (features).

## Styling
Semantic tokens only. No `dark:` — tokens switch automatically.

## Teardown
- None — RTK Query hooks unsubscribe automatically; no timers/listeners/AbortControllers owned
  directly by this component.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/features/auth-login
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

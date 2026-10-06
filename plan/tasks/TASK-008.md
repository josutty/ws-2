---
id: TASK-008
status: open
revision: 1
depends-on: [TASK-001]
created: 2026-10-01
---

# TASK-008: widgets/topbar — TopBar

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/widgets/topbar/ui/TopBar.tsx | connected | coder | new |
| src/widgets/topbar/index.ts | public api | coder | new |
| src/widgets/topbar/ui/TopBar.test.tsx | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: `useGetCurrentUserQuery` (`entities/session`), `useGetDealerCycleSummaryQuery`
  (`entities/cycle`).
- Client state: `sessionSlice.selectors.selectAuthStatus`/token via `useAppSelector` (for
  sign-out), theme read/write via `app/providers` `ThemeProvider` context (not a slice, D26).
- Mutations: none directly — sign-out dispatches a session action (store-architect-owned slice
  action, imported from `entities/session`), not a mutation call.
- Errors: `getDealerCycleSummary` failure → TopBar shows last-known values + a retry affordance
  rather than blocking nav (per api-integration-points.md — no full-page block here). `getCurrentUser`
  401 is handled by `app/providers`' `RequireAuth` gate, not by this component.
- No fetch/axios/useState for server data (AGENTS.md §3).

## Components

### TopBar (connected)
- Props: `activeView: 'home' | 'workbook'; onNavigate: (view: 'home' | 'workbook') => void`
  (cycle/status/user data sourced from hooks, not props, so they stay live across navigation)
- Shows: logo, nav buttons (Home, Indent workbook), current cycle + name, cutoff countdown,
  submission status pill, theme toggle, user name + code + role chip, sign-out.
- A11y: theme toggle and sign-out get `aria-label` ("Toggle theme", "Sign out") — fixes the
  components.md-noted gap (source had `title` only).
- Responsive: at `md:` breakpoint, status segments after the first collapse (only cycle name
  segment survives) — implemented as a Tailwind `md:` variant, not the raw `900px` value.

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| default | TopBar | logo, nav, cycle/cutoff/status, user chip |
| cutoff-imminent | TopBar | same visual treatment regardless of time remaining (standard, not drawn distinctly — matches source) |
| submitted | TopBar | "Status: Submitted" (green) replaces "Not submitted" |
| cycle-summary-error | TopBar | last-known values shown + retry affordance (not a blocking banner) |

## Tests (test-engineer writes RED first)
- TopBar.test.tsx: renders user/cycle/status from the query hooks; nav buttons call `onNavigate`
  with the right view; theme toggle button has `aria-label`; sign-out button has `aria-label` and
  dispatches the session sign-out action; `submitted=true` (from cycle summary) renders the green
  status text; `cycleSummaryServerError` scenario → last-known values remain visible + a retry
  control appears (no full-page banner).
- Coverage target: 80% (widgets).

## Styling
Semantic tokens only (bg-surface/text-fg for the bar's own dark-on-any-theme treatment — TopBar
uses the `--bar`/`--bar-ink` tokens from design-tokens.md, mapped to a semantic pair by
styling-engineer, e.g. `bg-topbar`/`text-topbar-fg`; confirm exact token name in
`plan/design-system.md`, Phase 3a). No hardcoded `dark:` — tokens switch automatically.

## Teardown
- None — RTK Query hooks unsubscribe automatically; theme toggle only flips a context value owned
  by `app/providers`.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/widgets/topbar
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

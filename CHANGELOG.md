# Agent team — revision changelog

## New file: AGENTS.md
Single source of truth for conventions: stack pins, FSD import matrix, data contract, styling,
testing, quality-gate commands, git rules, sensitive-data policy, HANDOFF format, file ownership.
OpenCode loads `AGENTS.md` from the project root into every agent, so put it at the repo root.
Agent files now reference it instead of repeating (and contradicting) each other.

## Architecture decisions made (review these first)
| Decision | Was | Now | Why |
|---|---|---|---|
| Server data | hand-written thunks + normalized slices | RTK Query (`baseApi` + `injectEndpoints`) | loading/error/cache/tags built in; removes most store bugs |
| Client state | nested `entities/features` reducers | `combineSlices` + `slice.selectors` | nested plain objects in `configureStore` don't work |
| RootState | imported from `@app` everywhere | global types in `app/store/types.d.ts` | removes the upward-import FSD violation |
| Test runner | Jest + ts-jest | Vitest (config inside vite.config.ts) | same aliases/env as Vite; no ESM/jsdom/MSW polyfill pain |
| Types from spec | LLM-written interfaces | `openapi-typescript` (deterministic) + alias file | no hallucinated fields |
| Spec format | custom JSON | valid OpenAPI 3 + `x-mock` / `x-proposed` | schema-parser, redocly and MSW all need real OpenAPI |
| Mocks location | `src/__mocks__` | root `mocks/` and `test/` | outside FSD layers (Steiger), no clash with Vitest `__mocks__` |
| Dev API modes | `NODE_ENV` + `REACT_APP_`/`VITE_` mix | `VITE_API_MODE` = mock / hybrid / real | hybrid = MSW only for mock endpoints, real ones pass through |
| FSD layers | no widgets, `store/types/hooks` segments | + `widgets/`, `ui/model/api/lib/config` | standard FSD; Steiger understands it |
| FSD validation | qartez at plan time (empty graph) | Steiger + ESLint in `npm run lint`; qartez optional | deterministic, works without MCP |
| Styling | hex tokens + `dark:` everywhere + CSS modules | semantic CSS-variable tokens, Tailwind 3.4 pinned | dark mode automatic; one styling mechanism |
| Contracts | prose rules | ESLint rules (max-lines 250, no fetch/axios/style/hex/console/any) | machine-enforced |

If you prefer to keep Jest or hand-written thunks, tell me and I'll revert those parts only.

## Workflow changes (orchestrator)
- Phase 1 order: wireframe-analyzer → hybrid-api-config → schema-parser → mock-data-generator → fsd-planner.
- mock-data-generator ALWAYS runs (tests need handlers even with a complete backend).
- Store + styling are a Phase 3a foundation (the only parallel step), not per-task work.
- Explicit per-TASK loop: test-engineer (RED) → component-generator → coder (GREEN) → reviewer(task).
- app-bootstrap Run 2 moved to after all TASKs; reviewer runs again at release scope.
- Every subagent returns `next=orchestrator`; full routing table incl. BLOCKED-TEST, NEEDS-RESEARCH from any agent, loop guards.
- Gate 1 rejection routes to the agent that produced the rejected artifact (not architect).

## Per-file changes
| File | Main fixes |
|---|---|
| 00b-hybrid-api-config | OpenAPI output; runs after wireframe-analyzer; query-param gaps ≠ new endpoints; backend-gaps.md; no-spec mode; removed localStorage idea; valid HANDOFFs |
| 01-schema-parser | openapi-typescript; bash allowlist for lint/tsc; carries mock flag into endpoints-map.json |
| 02-wireframe-analyzer | can now write `analysis/**`; API-neutral data needs; new design-tokens.md |
| 03-fsd-planner | widgets layer; component Kind (presentational/connected/page); RTK Query integration table |
| 04-architect | TASK Files table with owner per file; sizing/order rules; no longer writes store-design.md |
| 05-store-architect | RTK Query baseApi (auth, 401 event, error normalization); fixed selectors; makeStore for tests |
| 5_5-mock-data-generator | typed handlers for every endpoint; seeded faker; db + resetDb; test scenarios; browser/node split; PII rule |
| 06-component-generator | presentational only; tokens; stories with `fn()` + fixtures; can't edit tests |
| 07-styling-engineer | CSS-variable semantic tokens; Tailwind 3.4 config fixed; contrast check; runs before components |
| 08-test-engineer | Vitest; true RED-first per TASK with valid-RED rules; fresh store per test; fixed example bugs |
| 09-coder | connected components + pages; bash denies for destructive git/npm install; Cortex removed |
| 10-reviewer | bash allowlist; command-backed gates A–F; diff-vs-Files scope check; fixed grep syntax; PII scan |
| 11-orchestrator | see workflow changes above |
| 12-app-bootstrap | pinned deps; all configs incl. ESLint/Steiger/Storybook; `msw init`; branch; error boundaries; env module |
| 13-researcher | source search order; can't overwrite api-schema.md |
| 14-reflector | dedup + ESCALATE on recurrence; proposes concrete prompt edits |
| 15-debugger | can't edit tests (BLOCKED-TEST instead); known-failure table for this stack |

## Please verify in your OpenCode version
1. **Permission rule order.** My understanding is that OpenCode applies the LAST matching pattern,
   so every file now lists `"*"` FIRST and specific rules after it. Your original files had
   `"*": deny` LAST, which under last-match-wins would deny everything. Check your version's
   permissions docs; if it is first-match-wins instead, move `"*"` to the end of each block.
2. **bash can bypass edit permissions** (e.g. `sed -i`). Coder/debugger/app-bootstrap have broad
   bash; the reviewer's diff-vs-Files-table check is the real enforcement.
3. **Model tiering.** All agents still use `opencode-go/deepseek-v4-flash`; comments mark
   architect, fsd-planner, reviewer, debugger and orchestrator as candidates for a stronger model,
   and reviewer ideally a different model than coder.
4. **qartez tool names** (`qartez_diff_impact`, `qartez_cochange`, `qartez_unused`) — confirm they
   exist in your qartez build; agents treat qartez as optional now.
5. **Version pins** (React 19, Vite 6, Vitest 3, Storybook 8, Tailwind 3.4) — adjust in AGENTS.md
   §1 and app-bootstrap if your org standardises on others.

---

# Revision 2 — modes, scanner, coverage, FSD doc

## New
| File | Purpose |
|---|---|
| 16-codebase-scanner.md | Read-only scan of an existing project → `PROJECT.md` (real conventions, command map, baseline failures) |
| 17-coverage-checker.md | Traces every HTML element, UI state, endpoint and data need → component → slice → TASK → file → test; writes `plan/coverage-matrix.md` |
| PLAYBOOK.md | How to install and run the team, with copy-paste prompts for each mode |

## Changed
| File | Change |
|---|---|
| AGENTS.md | §0 modes + `PROJECT.md` precedence (never migrate old code unasked) + delta rules; BUG-NNN ids; new owned files |
| 11-orchestrator | Intake step; four modes (new-project, gap-fill, feature, bugfix) with their own routes; coverage checks before every gate; hybrid-api-config now always runs so later YAML versions can be diffed |
| 00b-hybrid-api-config | Delta mode: merges new backend YAML into the baseline, flips mock → real, records contract drift in `api-changes.md` |
| 01-schema-parser | Delta: stable alias names, reports files that stop compiling |
| 02-wireframe-analyzer | `Source:` selector per component (for tracing); delta mode + `analysis/CHANGES.md` |
| 03-fsd-planner | Client FSD doc REQUIRED in new-project mode and authoritative; compliance table; delta/feature placement from PROJECT.md |
| 04-architect | Delta TASKs from coverage gaps (`Closes gaps:`); BUG-NNN template |
| 05-store-architect | Delta from api-changes.md; extends an existing project's own data mechanism instead of adding RTK Query |
| 5_5-mock-data-generator | Delta: new handlers, real endpoints leave `mockOnlyHandlers` |
| 08-test-engineer | Bugfix regression-test rule (must fail on current code for the reported reason) |
| 10-reviewer | Compares against PROJECT.md baseline — pre-existing failures aren't blamed on the agents |
| 12-app-bootstrap | Run R (retrofit): adds missing standard npm scripts as aliases, never new tools; ships `tools/list-html-elements.mjs` |
| 15-debugger | `mode=diagnose` for bug reports: root cause first, no fix before the regression test |

## Important: agent names
OpenCode names agents after their file names. Rename the files as listed in PLAYBOOK.md,
otherwise the orchestrator's dispatches (`coder`, `reviewer`, …) won't find them.

---

# Revision 3 — branch safety, non-FSD projects, browser-only bugs

## Fixed
| File | Change |
|---|---|
| orchestrator, app-bootstrap, AGENTS.md §7 | **Run B** always runs first in feature / bugfix / gap-fill: creates `feat/<name>` or `fix/<slug>` from the base branch, stops on a dirty tree. Previously a run on a project with all scripts present committed to whatever branch was checked out. Retrofit folded into Run B. |
| codebase-scanner | Records `base-branch` in PROJECT.md; test commands run with `CI=true` (Jest watch mode hung); `-u` deny narrowed to the exact flag (it blocked `git status -uno` etc.) |
| reviewer | Release diff uses `<base-branch>...HEAD` instead of hardcoded `main`; P0 if work is on the base branch |
| coder, component-generator, store-architect | Path permissions widened to `src/**` with explicit denies, so non-FSD projects (`src/components`, `src/store`, Next.js `src/app`) are editable. TASK Files table + reviewer scope check remain the real boundary (AGENTS.md §7). |
| coder, debugger, app-bootstrap | bash denies close easy bypasses: `rm *` (was only `rm -rf*`), `sed -i`, `perl -i`, `curl`, `wget`, `git checkout`/`switch`/`stash`. Revert with `git restore --source=<start-sha>`. |
| debugger | Edit permissions now match its own "Never" list (no store/api/config/theme). New **browser-only** path: optional Playwright MCP, otherwise an `unverified` code-reading diagnosis + manual repro steps → BLOCKED for a human decision. |
| coverage-checker | Removed `node -e*` permission (ESM `import` failed without `--input-type=module`, and it let the agent write files). Uses only `tools/list-html-elements.mjs` (Run B ships it) or a grep fallback. |
| orchestrator, fsd-planner | Client FSD doc can be waived explicitly (`client-fsd=none`); backend YAML is optional (no-spec mode already existed but intake demanded a YAML). |
| orchestrator, app-bootstrap | Run 2 is incremental: pages are routed as their TASKs pass, so the app is clickable mid-run. Final Run 2 still checks every page exists. |
| AGENTS.md, fsd-planner, coder | Pages rule aligned with the import matrix: composition only, widgets preferred, features/entities allowed. |
| researcher, hybrid-api-config | `wireframes.html` → `inputs/ux/*.html`; spec path → `inputs/api/…` |
| mock-data-generator | Existing projects use their own base-URL helper; no MSW → BLOCKED instead of assuming |
| PLAYBOOK, README | Waivers, Run B, browser-only bugs, model-tiering table; README filled in |

## Not changed (your decision)
- `model:` lines — pick models from your provider using the PLAYBOOK tiering table.
- Version pins (Tailwind 3.4, Vite 6, Storybook 8) — newer majors exist; bump AGENTS.md §1 + app-bootstrap together if your org wants them.
- test-engineer, wireframe-analyzer, styling-engineer weren't part of this revision's files; check
  they honour Run B (no branch creation of their own), `*.spec.*` test naming, and PROJECT.md paths.

---

# Revision 4 — verified templates, the three missing agents, quick mode, E2E

Method: a reference app was built from the agents' own templates and every quality gate was run on
it (typecheck, ESLint + Steiger, Vitest, coverage, production build, Storybook build, contrast
check). Templates were then re-extracted from the edited agent files and re-run, so the text you
ship is the text that passed. Not executed: Playwright e2e (the verification sandbox couldn't
download a browser) — config and specs typecheck and lint.

## New agents
| File | Purpose |
|---|---|
| wireframe-analyzer | UX HTML → components (props + traceable Source selector), UI states, classified data needs, raw design tokens; delta mode with CHANGES.md |
| styling-engineer | Semantic CSS-variable tokens (light + dark), Tailwind theme, base styles (focus ring, reduced motion), applyTheme(), machine-checked WCAG contrast, design-system.md |
| test-engineer | RED-first tests with classified failure reasons, start-sha, harness (setup + renderWithProviders), Playwright smoke + axe per route, e2e regression tests for browser-only bugs |

## Bugs found by running the templates (each would have blocked or misled the team)
| Where | Problem | Fix |
|---|---|---|
| Steiger config | `insignificant-slice` errors on every slice with ≤ 1 consumer (normal while TASKs land bottom-up); `segments-by-purpose` rejects the `app/store`, `app/providers` folders AGENTS.md requires → `npm run lint` could never pass | `insignificant-slice: warn`; `segments-by-purpose` off for `src/app/**`. Cross-slice imports still fail (verified) |
| store-architect | `ListProductsParams \| void` fails strict lint (`no-invalid-void-type`) | params object, callers pass `{}` |
| component-generator, tests | `productFixtures[0]!` fails strict lint (`no-non-null-assertion`) | `at()` helper in `mocks/lib.ts` |
| ESLint config | `tools/*.mjs` fail `no-undef` (process, console) | node globals for js/mjs/cjs |
| ESLint + reviewer grep | hex rule flagged `href="#add-to-cart"`, missed template literals | tighter selectors + portable ERE grep (both verified) |
| vite.config.ts | Vitest collected Playwright specs from `e2e/` | `test.include` |
| hybrid-api-config, schema-parser | redocly's default ruleset errors on valid specs that only lack summaries/security → BLOCKED on style | `--extends=minimal` decides; style findings go to backend-gaps.md "Spec quality" |
| app-bootstrap deps | unpinned `jsdom` now installs v30 (Node ≥ 22.22); Steiger 0.7 needs Node ≥ 22.18 | Node precondition + `engines` + `.nvmrc`; every dev dep pinned to the verified major |
| app-bootstrap | `"type": "module"` never set, yet every config file is ESM | `npm init` step sets it |
| coder vs component-generator | the two ProductCard examples had different props — copying both didn't compile | slot pattern `actions?: ReactNode` everywhere |
| component-generator | could never report a clean typecheck on mixed TASKs (RED tests import coder files that don't exist yet) | TS2307 in coder-owned test files explicitly allowed and logged |
| orchestrator | the parallel foundation step had two agents committing to one working tree (index.lock collisions, `git add .` staging each other's files) | sequential; path-only staging in AGENTS.md §7; `git add -A/./--all`, `git commit -a` denied |
| test harness | RTL only auto-cleans with Vitest globals (not enabled) | explicit `cleanup()`; matchMedia polyfill |
| app shell | `RouterProvider` from `react-router` (non-DOM entry) | `react-router/dom` |
| Storybook | telemetry on by default | `disableTelemetry: true` |

## New capabilities
- **`quick` mode** — branch → one small TASK → review, for changes ≤ 3 files; architect bounces anything bigger ("not quick").
- **E2E** — Playwright (desktop + mobile) against dev in mock mode; per-route smoke: axe WCAG 2.2 AA in light and dark, no mobile overflow, no console errors. Reviewer gate G. Browser-only bugs get e2e regression tests instead of a human block.
- **AGENTS.md §12 UI conventions** — accessibility bar (WCAG 2.2 AA, targets ≥ 24px, focus, dialogs), forms (react-hook-form + zod 4, verified), routing + `RequireAuth` guard (verified with a redirect test), Intl formatting, performance, responsive.
- **tools/check-contrast.mjs** — contrast is computed, not eyeballed (verified to fail on a bad pair).
- Extractor prints `role` and `data-state`, so UI states in the HTML are traceable.

## Still your decision
- `model:` lines — biggest remaining quality lever (PLAYBOOK tiering table).
- Toolchain age — pins are 1–2 majors behind (Vite 8, Vitest 5, Storybook 10, Tailwind 4, ESLint 10, TS 7, MSW 3, React Router 8 are current) and ESLint 9 is marked unsupported. Upgrade as its own verified revision, all pins together.

---

# Revision 5 — works for non-technical users

| File | Change |
|---|---|
| orchestrator | New "Talking to the human" rules: a plain-language status card after every step, a Problem / Why / numbered-options format for failures, gate checklists with ready replies, typed commands (`status`, `help`, `explain`, `resume`, `undo last step`), recognition of common situations, no raw HANDOFF lines or error codes shown, never asks the human to run git/terminal commands |
| orchestrator | Resume now detects an interrupted step (no final HANDOFF, cut-off files) and re-runs only that agent to repair it |
| orchestrator | A page TASK is not finished until its page is wired — even when told "stop after the review" (this was the cause of the blank "Bootstrapping" screen) |
| app-bootstrap | The placeholder screen tells the user what to say instead of "Bootstrapping…" |
| PLAYBOOK | Plain-language "if something goes wrong" table |

---

# OpenCode kit additions
- `.opencode/commands/`: 9 shortcut commands (verified discovered by OpenCode 1.18.34, all routed to the orchestrator)
- `tools/check-install.mjs`: plain-language install check (verified on a good, a broken and an empty copy)
- `tools/set-models.mjs` + `models.json`, `opencode.json`, `.vscode/tasks.json`, `inputs/` scaffold

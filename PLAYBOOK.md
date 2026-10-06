# Playbook — how to run the agent team

## One-time setup (per machine)
0. Install **Node 22.22+ (or 24.15+)**. The first run also downloads Playwright's Chromium
   (`npx playwright install chromium`), so it needs network access once.
1. Copy all agent files into your OpenCode agents folder (project `.opencode/agents/`, or global `~/.config/opencode/agents/`; very old OpenCode versions use `agent/` without the s). They already carry the names
   the orchestrator dispatches by (`coder.md` → agent `coder`) — don't rename them. The team is 19
   agents; the orchestrator stops with "<agent> not available" if one is missing.
2. Copy `AGENTS.md` into the ROOT of every project repo you run the team on.
3. Select the **orchestrator** as the primary agent. You only ever talk to the orchestrator.

## Put inputs in the same place every time
```
inputs/
├── fsd-spec.md          client's FSD document (any format → save as .md)
├── ux/                  one .html per screen (products.html, cart.html…)
└── api/backend-api.yaml backend team's YAML (partial or complete)
```

## Mode 1 — new project
```
Mode: new-project.
Inputs: inputs/fsd-spec.md, inputs/ux/*.html, inputs/api/backend-api.yaml (partial).
Branch name: feat/shop-v1.
Run Phase 0 and Phase 1 only, then stop at Gate 1.
```
At Gate 1: open `plan/coverage-matrix.md` first → every gap either fixed or marked out-of-scope by you.
Send `plan/generated/backend-gaps.md` to the backend team.
Then: `Gate 1 approved. Run Phase 2 and stop at Gate 2.` → review tasks →
`Gate 2 approved. Run Phase 3 and 4.`

No client FSD doc? Say so explicitly: `No client FSD doc — use AGENTS.md defaults.`
No backend YAML yet? Leave it out — every endpoint is proposed + mocked, and backend-gaps.md becomes
the spec you hand the backend team.

Pages are wired into the router as their TASKs pass, so `npm run dev` shows finished screens mid-run.

Tip for your first project: start with 1–2 screens. Look at every file the agents write.

## Mode 2 — something is missing (project built by this team)
Found it yourself:
```
Mode: gap-fill. The Products page has no sort dropdown (it's in inputs/ux/products.html),
and the Empty state on the catalog never shows.
```
Backend sent a new YAML:
```
Mode: gap-fill. New backend spec: inputs/api/backend-api-v2.yaml. Update the project.
```
Not sure what's missing:
```
Mode: gap-fill. Run coverage-checker at stage=release and show me the gaps before doing anything.
```

## Mode 3 — new feature in an existing project (any project)
```
Mode: feature. Add a "Wishlist" feature: heart button on product cards, wishlist page.
UX: inputs/ux/wishlist.html. API: inputs/api/wishlist.yaml (partial).
```
The first run on a project not built by this team creates `PROJECT.md`.
**Read PROJECT.md before approving anything** — if it describes the project wrongly, every agent
will follow the wrong rules. Correct it by telling the orchestrator what's wrong.

## Mode 4 — bug fix
Give steps, expected, actual:
```
Mode: bugfix.
Bug: on /products, when the list fails to load, clicking Retry does nothing.
Steps: set VITE_API_MODE=mock, block /api/products in devtools, reload, click Retry.
Expected: list reloads. Actual: nothing happens, no network request.
```
The team diagnoses first, writes a test that fails because of the bug, then fixes it.
Layout, focus, scroll and other browser-only bugs get a Playwright regression test instead of a
jsdom one, so they go through the same RED → GREEN loop. Projects without Playwright get a
`browser-only` diagnosis and you decide: add Playwright, fix with manual verification, or stop.

## Mode 5 — quick change (≤ 3 files, no new endpoint/slice/route)
```
Mode: quick. On product cards, show the price in bold and rename "Add to cart" to "Add".
```
Branch → a one-TASK plan → tests that assert the old text are updated → change → review → Gate 3.
If the change turns out bigger, the architect says "not quick" and the orchestrator asks to switch
to feature or bugfix.

A typo in a comment still doesn't need the team — a single chat with AGENTS.md in the repo is fine.

Every feature/bugfix/gap-fill run starts on a new branch (`feat/<name>` or `fix/<slug>`) created from
PROJECT.md's `base-branch`. Commit or stash your own work first — the team stops on a dirty tree.

## Model tiering (edit the `model:` line in each agent file)
All agents ship on one model. Recommended split — use whatever strong/fast models your provider has:
| Tier | Agents |
|---|---|
| Strongest | orchestrator, architect, fsd-planner, debugger |
| Strong, and a DIFFERENT model family from coder | reviewer |
| Fast | coder, component-generator, store-architect, test-engineer, mock-data-generator, schema-parser, hybrid-api-config, codebase-scanner, coverage-checker, researcher, reflector, app-bootstrap |

## Useful commands to the orchestrator
- `Where are we?` — it reads plan/PROGRESS.md and reports.
- `Resume.` — continues from the last HANDOFF after a crash or a new session.
- `Stop after the current TASK.` — safe pause point.
- `Show me the gaps.` — runs coverage-checker.

## What to check at each gate (5-minute version)
| Gate | Open these | Ask yourself |
|---|---|---|
| 1 | coverage-matrix.md, analysis/components.md, backend-gaps.md, fsd-structure.md compliance table | Is every screen element there? Does placement follow the client's FSD doc? |
| 2 | PROGRESS.md, 2–3 TASK files | Is each TASK small? Are the props and states what the UX shows? |
| 3 | reviewer result (gates A–G incl. e2e + axe), coverage-matrix.md | Run `npm run dev`, click through every screen in light + dark, then once with the keyboard only. |


## If something goes wrong — plain-language guide (no coding needed)
The orchestrator explains problems in everyday words and gives numbered choices — just reply with the
number. You can also type these to the orchestrator at any time:

| You type | What happens |
|---|---|
| `status` | tells you where the project is, what is done, what is next |
| `help` | runs the checks and explains any problem in plain words |
| `explain` | says what the last step did and why |
| `resume` | continues after a break, a sign-in expiry or a closed window — nothing is lost |
| `undo last step` | shows what the last step changed and reverts only that, after you confirm |

| What you see | What it means | What to type |
|---|---|---|
| Chat stopped / sign-in or usage-limit message | the session ended, your work is saved | sign in again → new chat → orchestrator → `resume` |
| Blank page, or a message about setup / "Bootstrapping" | pages aren't connected yet | `connect the finished pages` |
| The orchestrator says "Problem: …" with options | an agent got stuck | reply with the number (the first option is recommended) |
| The result looks wrong at a gate | something was misunderstood | `reject: <what is wrong, which screen>` |
| Not sure where you are | — | `status` |
| You changed a screen or requirement | inputs changed | `Mode: gap-fill. Change: <what changed>. Updated inputs: <files>` |
| Want only some tasks | — | `Run only TASK-003 and TASK-016` (it checks they don't depend on others) |

## Shortcut commands (OpenCode)
Instead of pasting long prompts: `/new-project <name>`, `/feature <what>`, `/bugfix <what>`, `/quick <what>`, `/gap-fill <what changed>`, `/status`, `/resume`, `/approve`, `/reject <what is wrong>`. They start the orchestrator with the same prompts shown above. `node tools/check-install.mjs` checks that everything is installed.

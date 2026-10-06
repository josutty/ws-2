# ai-agents

A 19-agent OpenCode team that builds and maintains React 19 + TypeScript + RTK Query + Tailwind
apps in Feature-Sliced Design — and follows an existing project's own conventions when it isn't FSD.

| Mode | Use for |
|---|---|
| `new-project` | build from a client FSD doc + UX HTML (+ backend OpenAPI YAML, optional) |
| `gap-fill` | something from the inputs is missing, or the backend sent a new YAML |
| `feature` | add a feature to any existing project |
| `bugfix` | diagnose → failing regression test (unit or e2e) → fix |
| `quick` | small change: ≤ 3 files, no new endpoint/slice/route |

Quality bar enforced by commands, not prose: strict TypeScript, ESLint + Steiger (FSD), RED-first
tests, coverage thresholds, Storybook build, Playwright smoke + axe (WCAG 2.2 AA) per route in light
and dark, machine-checked color contrast.

Start here:
- **PLAYBOOK.md** — install, copy-paste prompts for each mode, what to check at each gate
- **AGENTS.md** — conventions every agent follows (copy into each project root)
- **CHANGELOG.md** — what changed and why
- **reference-app.zip** — the app built from the agents' templates to verify them
  (`npm ci && npm run typecheck && npm run lint && npm test && npm run build`)

Requires Node 22.22+ (or 24.15+).

## Setup
See **README-OPENCODE.md** (VS Code steps, models, tasks).
# ws-2

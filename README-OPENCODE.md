# Agent team — OpenCode edition (open in VS Code)

Unzip into the ROOT of your project repo, then open that folder in VS Code.

> **Can't see the agents?** They are in **`.opencode/agents/`** (19 files). Phone file viewers, macOS Finder
> and some zip viewers hide folders whose name starts with a dot. Unzip on the computer and look in VS Code's
> Explorer, which always shows them. Or use **agents-visible.zip** (same files in normal folders) and follow
> its README-FIRST.txt. In OpenCode, **Tab only lists the orchestrator** — the other 18 are subagents it
> calls itself; `opencode agent list` shows all of them.

```
your-repo/
├── AGENTS.md                  conventions — OpenCode loads it automatically
├── PLAYBOOK.md                prompts for each mode, gates, "if something goes wrong" table
├── opencode.json              starts on the orchestrator; Serena MCP (off by default)
├── models.json                the 4 model names (one place) → node tools/set-models.mjs
├── .opencode/agents/          19 agents — orchestrator (primary) + 18 subagents
├── .opencode/commands/        shortcut commands: /new-project /feature /bugfix /quick /gap-fill /status /resume /approve /reject
├── .githooks/pre-commit       blocks commits on main / master / develop
├── .vscode/tasks.json         "OpenCode: start team", "check agents loaded", "apply models.json"
├── tools/check-install.mjs    tells you in plain words if anything is missing
├── tools/set-models.mjs
├── inputs/                    put your fsd-spec.md, ux/*.html, api/*.yaml here
└── reference-app.zip          sample app built from the agents' templates (optional)
```

## Setup (5 minutes)
1. Install OpenCode if you haven't (opencode.ai) and the **OpenCode extension** for VS Code (you can then
   press **Ctrl+Esc** to open OpenCode in a split terminal). Node 22.22+ is needed by the projects the team builds.
2. In the VS Code terminal, once per clone: `git config core.hooksPath .githooks`
3. Models: run `opencode models` to see yours → edit the four names in **models.json** → run
   `node tools/set-models.mjs` (or Terminal → Run Task → *Team: apply models.json*).
   Tiers: **strongest** = architect, fsd-planner, wireframe-analyzer, debugger · **strong** = orchestrator and the
   builders · **reviewer** = use a DIFFERENT model family from the coder · **fast** = schema-parser,
   coverage-checker, app-bootstrap, researcher, reflector.
4. Check: Terminal → Run Task → *Team: check install* (or `node tools/check-install.mjs`). ❌ lines are problems with the fix
   next to them; ⚠️ lines are optional. Then *Team: check agents loaded* should list `orchestrator (primary)` and 18 `(subagent)`.
5. Start: Terminal → Run Task → *OpenCode: start team* (or Ctrl+Esc). The orchestrator is selected
   already; **Tab** cycles agents. Paste a prompt from PLAYBOOK.md — or use the shortcuts:

| Type | Does |
|---|---|
| `/new-project shop-v1` | starts a new project from `inputs/`, stops at Gate 1 |
| `/feature wishlist page` | adds a feature to an existing project |
| `/bugfix cart total stays after removing last item` | diagnoses, writes a failing test, fixes |
| `/quick rename Sign in to Log in` | small change |
| `/gap-fill orders screen now filters by status` | a requirement changed |
| `/status` · `/resume` | where are we · continue after a break |
| `/approve` · `/reject <what is wrong>` | answer a gate |

## How limits are enforced here
OpenCode reads each agent's `permission:` block itself (edit paths, allowed commands). No guard script
is needed. The pre-commit hook blocks commits on the base branch, and the reviewer checks that only the
task's files changed.

## Optional: code-intelligence tools
Serena is configured but **disabled** in `opencode.json` (needs `uv`). To turn it on set `"enabled": true`.
Agents work without it. Add Qartez the same way under `"mcp"` with your own command.

## What was tested
Real OpenCode 1.18.34: all 19 agents load from `.opencode/agents/` (orchestrator = primary, others = subagent),
`opencode.json` is accepted, and `set-models.mjs` rewrites every model line without breaking loading.
**Not tested:** a live run with a real model, and the VS Code tasks (no VS Code in my sandbox).
If the orchestrator says it can't start agents, update OpenCode — older versions had a bug with
markdown-defined agents launching subagents.

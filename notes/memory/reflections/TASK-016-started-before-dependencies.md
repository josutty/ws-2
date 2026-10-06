# Reflection: TASK-016 — started-before-dependencies
Trigger: HANDOFF: status=BLOCKED-DESIGN next=orchestrator task=TASK-016 reason="Required widget dependencies TopBar, WorkbookToolbar, IndentGrid, and LineDetailDrawer are missing, and implementing or substituting them inside the page would violate the TASK contract and Files table."
Upstream agent: architect

## What was missed
TASK-016 was resumed/advanced while its declared dependency tasks TASK-008, TASK-013 and TASK-014 were still `open`, so the page contract required composing widgets that did not exist. The TASK-016 Files table correctly forbids implementing those widgets in the page, leaving coder with no in-contract path to GREEN.

## Where it should have been caught
Architect/orchestrator dependency scheduling should have checked `plan/PROGRESS.md`'s `Depends on` column before dispatching or honoring an existing `in-progress` page TASK. The TASK template's dependency section should have blocked page implementation until all composed widget/feature dependency TASKs were `done`.

## Guard that catches it next time
Before dispatching any non-review agent, run a dependency gate over `plan/PROGRESS.md`: for the target TASK, every TASK id in `Depends on` must have `Status == done`; if not, select the earliest open dependency in table order instead of the requested/in-progress TASK.

## Rule for the next plan
Dispatch an in-progress TASK only after all of its `Depends on` TASKs are `done`; otherwise reset/reorder it and resume the earliest open dependency in `plan/PROGRESS.md` order.

## Suggested agent-prompt change (for a human to apply)
File: architect.md · Section: TASK ordering / resume · Add: "When resuming or ordering TASKs, verify each target TASK's `Depends on` entries are `done` in `plan/PROGRESS.md`; if any dependency is open, do not dispatch the target TASK and instead return the earliest open dependency in PROGRESS order, or rewrite the plan to make that dependency explicit."

## Recurred — TASK-010
Trigger: HANDOFF: status=BLOCKED-DESIGN next=orchestrator task=TASK-010 reason="TASK-010 tests and Storybook are GREEN, but required full gates cannot be made GREEN without editing out-of-scope open TASK-016 WorkbookPage and pre-existing tools/check-install.mjs lint failures"
Upstream agent: architect

### What was missed
TASK-010's local contract was satisfied by its focused widget tests, TASK-owned lint, and Storybook build, but the TASK DoD/review expectation treated unrelated full-gate failures from open later TASK-016 and pre-existing `tools/check-install.mjs` lint as TASK-010 design blockers. That incorrectly pressures agents to proceed to or edit later/out-of-scope work instead of completing TASKs in `plan/PROGRESS.md` order.

### Where it should have been caught
Architect TASK template `Dry-run (DoD)` and reviewer quality-gate interpretation should distinguish TASK-local completion evidence from repository-wide failures caused solely by files outside the TASK Files table or known pre-existing baseline issues.

### Guard that catches it next time
Require every BLOCKED-DESIGN/FAIL-MECH caused by full gates to include a failing-file classification table: `TASK-owned`, `dependency TASK`, `later open TASK`, or `pre-existing baseline`; only `TASK-owned` and unmet declared dependencies may block the current TASK, while `later open TASK` and baseline rows become recorded concerns and the orchestrator resumes the earliest open TASK in order.

### Rule for the next plan
ESCALATE: Accept a TASK as locally complete when all TASK-owned tests and scoped lint/build evidence are green and full-gate failures are exclusively from later open TASKs or documented baseline defects.

### Suggested agent-prompt change (for a human to apply)
File: reviewer.md · Section: Quality gates / verdicts · Add: "When full quality gates fail, classify each failing file against the current TASK Files table and `plan/PROGRESS.md`; do not block or bounce a TASK for failures that are exclusively from later open TASKs or documented pre-existing baseline defects—record them as concerns and allow the orchestrator to continue in PROGRESS order."

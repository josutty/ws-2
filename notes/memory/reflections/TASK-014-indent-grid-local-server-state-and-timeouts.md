# Reflection: TASK-014 — indent-grid-local-server-state-and-timeouts
Trigger: HANDOFF: status=FAIL-MECH next=orchestrator task=TASK-014 reason="P0: targeted TASK-014 tests/npm test still fail with timeouts/unhandled cancelAnimationFrame errors; IndentGrid.tsx (coder) still uses local useState copied editable cell values instead of RTK Query optimistic cache update"
Upstream agent: coder

## What was missed
`IndentGrid.tsx` still keeps server-backed editable cell values in local `editingValues` state, despite the TASK-014 Integration contract requiring RTK Query optimistic cache updates only. The repair also accepted isolated Vitest success even though reviewer-targeted `npm test -- src/widgets/indent-grid` still exposes timeouts and unhandled `cancelAnimationFrame` cleanup errors.

## Where it should have been caught
Coder's pre-handoff Integration contract sweep should have checked TASK-014 lines 37-38 and rejected any `useState`/local map that copies editable server cell values. The coder/test repair verification should also have required the exact reviewer command, not only isolated `npx vitest`, before claiming TASK-014 tests were green.

## Guard that catches it next time
Before handoff, run and record both: `rg "editingValues|setEditingValues|useState<ReadonlyMap|useState\(new Map" src/widgets/indent-grid/ui/IndentGrid.tsx` with no hits for server cell values, and `npm test -- src/widgets/indent-grid --reporter=verbose` completing without timeouts or unhandled `cancelAnimationFrame` errors; add a test assertion that an edit updates/reverts through the RTK Query cached row value rather than a component-local value map.

## Rule for the next plan
Replace local copied cell-value state with RTK Query optimistic cache updates and prove the exact reviewer test command is timeout-free before re-dispatching review.

## Suggested agent-prompt change (for a human to apply)
File: coder.md · Section: Pre-handoff checks · Add: "For connected editable grids, grep for local copied server-data state (`editingValues`, `setEditingValues`, `useState(new Map)`) and hand off only when optimistic edits are implemented in RTK Query cache plus the exact reviewer `npm test -- <task path> --reporter=verbose` command passes without timeouts or unhandled async errors."

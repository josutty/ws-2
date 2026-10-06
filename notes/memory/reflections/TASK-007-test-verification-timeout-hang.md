# Reflection: TASK-007 — test-verification-timeout-hang
Trigger: HANDOFF: status=FAIL-MECH next=orchestrator task=TASK-007 reason="P0 gate C/TASK-specific Vitest did not complete within 300s in reviewer verification, so 17 TASK tests cannot be confirmed green; owner test-engineer"
Upstream agent: test-engineer

## What was missed
TASK-007 tests were repaired from explicit `delay('infinite')` handlers to deferred promises, but the test artifact still had no teardown/watchdog proof that loading-state tests finish all RTK Query/MSW work and unmount cleanly in an independent reviewer run. The repeat timeout, including a single-test retry timing out before a summary, points to leaked async work or runner-level hang risk that was not guarded by the test handoff evidence.

## Where it should have been caught
Test-engineer's GREEN verification checklist should have flagged any test that intentionally holds a network response open unless the same test awaits post-resolution settlement and records a focused repeat run, especially in the loading-state tests for `CommitBar` and `ReviewSubmitModal`.

## Guard that catches it next time
Add a machine-checkable async-cleanup guard for tests with deferred/pending MSW handlers: grep for `deferred\(|delay\('infinite'\)|new Promise` in TASK test files, and require each hit to be paired with an awaited settlement assertion after `resolve()` plus evidence from `npx vitest run <TASK tests> --reporter=dot --testTimeout=10000 --hookTimeout=10000` run twice consecutively.

## Rule for the next plan
Require loading-state tests to release pending handlers, await a completed UI/network state after release, and prove two consecutive focused Vitest runs complete under explicit per-test timeouts before handoff.

## Suggested agent-prompt change (for a human to apply)
File: test-engineer.md · Section: GREEN verification / async tests · Add: "For any TASK test that uses deferred promises, pending MSW handlers, or loading-state assertions, resolve the pending work, await a post-resolution UI/network assertion, grep-record the async pattern, and paste evidence that the focused TASK Vitest command passed twice with explicit `--testTimeout=10000 --hookTimeout=10000`; otherwise hand off BLOCKED-TEST."

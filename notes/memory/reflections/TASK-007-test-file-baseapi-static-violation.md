# Reflection: TASK-007 — test-file-baseapi-static-violation
Trigger: HANDOFF: status=FAIL-MECH next=orchestrator task=TASK-007 reason="P0 backup static check found NEW TASK-007 baseApi imports/usages in src/features/submit-indent/ui/CommitBar.test.tsx and src/features/submit-indent/ui/ReviewSubmitModal.test.tsx; owner test-engineer"
Upstream agent: test-engineer

## What was missed
The timeout-hang repair added `baseApi` imports and `baseApi.util.resetApiState()` calls directly in TSX test files, violating the required backup static check for `fetch`/`axios`/`baseApi` in TSX. The likely cause was fixing RTK Query cleanup locally in the tests without rerunning or recording the static grep guard after the repair.

## Where it should have been caught
Test-engineer's post-repair GREEN verification checklist should have rerun the TASK-file forbidden-pattern static checks after any cleanup/harness change, specifically the `baseApi` TSX check against `src/features/submit-indent/ui/*.test.tsx`.

## Guard that catches it next time
Run and record a TASK-scoped static grep before handoff: `rg "fetch\(|axios|baseApi" src/features/submit-indent/ui/*.test.tsx`; the command must return no hits while the focused Vitest command still proves the same loading/error/success coverage.

## Rule for the next plan
Remove direct API-layer imports from TSX tests and preserve async cleanup by resolving pending MSW handlers, awaiting post-resolution UI assertions, and unmounting rendered views instead of dispatching `baseApi` from test files.

## Suggested agent-prompt change (for a human to apply)
File: test-engineer.md · Section: GREEN verification / static checks · Add: "After every test repair, run a TASK-scoped forbidden-pattern grep for `fetch(`, `axios`, and `baseApi` in touched `.test.tsx` files; if cleanup is needed, use test-owned unmount/settlement patterns or a harness helper, never direct API-layer imports in TSX tests, and do not weaken existing assertions."

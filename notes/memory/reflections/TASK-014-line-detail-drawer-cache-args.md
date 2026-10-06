# Reflection: TASK-014 — line-detail-drawer-cache-args
Trigger: HANDOFF: status=FAIL-DESIGN next=orchestrator task=TASK-014 reason="LineDetailDrawer selects a hard-coded size-50 listDealerIndentLines cache while IndentGrid populates the size-10/search/sort cache, so opening details from the grid can render nothing; drawer tests prime only the wrong drawer-specific cache."
Upstream agent: test-engineer

## What was missed
`LineDetailDrawer.test.tsx` primes `listDealerIndentLines` with `{ page: 0, size: 50, includeReference: true }`, matching the drawer's hard-coded selector instead of the grid's actual `{ page: 0, size: 10, includeReference: true, search, sort }` cache args. This missed the TASK-014 lines 62-64 contract that the drawer must source the selected line from the same RTK Query cache populated by the grid, not a drawer-specific cache key.

## Where it should have been caught
Test-engineer's Integration contract coverage checklist should have translated TASK-014 lines 62-64 into a test that renders/primes the grid query path and asserts the drawer reads that same cached line by id without priming a second `listDealerIndentLines` selector key.

## Guard that catches it next time
Add a drawer integration test that primes only `useListDealerIndentLinesQuery({ page: 0, size: 10, includeReference: true, search, sort })`, opens/renders `LineDetailDrawer` for that line, and verifies no test helper or production code contains `listDealerIndentLines.select({ page: 0, size: 50` for TASK-014.

## Rule for the next plan
Test cache-sharing contracts with the exact producer query args and fail any consumer that hard-codes its own RTK Query cache key. `ESCALATE`

## Suggested agent-prompt change (for a human to apply)
File: test-engineer.md · Section: Integration contract coverage · Add: "When a component must read from another component's RTK Query cache, write a test that primes only the producer's exact query args and greps for forbidden consumer-specific `endpoint.select({...})` hard-coded args."

## Recurred — 2026-10-06
Trigger: HANDOFF: status=FAIL-MECH next=orchestrator task=TASK-014 reason="LineDetailDrawer.tsx coder data-cache contract mismatch: drawer does not source line from the same listDealerIndentLines cache used by IndentGrid"
Upstream agent: coder

### What was missed
The connected child view `LineDetailDrawer.tsx` still violated the TASK-014 lines 62-64 cache-sharing contract by sourcing the selected line from a `listDealerIndentLines` cache path that can differ from the parent `IndentGrid` producer cache. A coder fix must preserve the same cache used by `IndentGrid`, or bounce to architect when the drawer props are insufficient to identify that cache.

### Where it should have been caught
Coder's TASK Integration contract implementation check should have compared the drawer's selector/cache source against `IndentGrid.tsx`'s actual `useListDealerIndentLinesQuery` args before reporting the cache-sharing contract repaired.

### Guard that catches it next time
Add a mechanical review grep/test pair for connected child cache sharing: assert `LineDetailDrawer` renders after only the `IndentGrid` query args are cached, and grep the drawer for forbidden hard-coded `listDealerIndentLines` selector args that do not come from the parent/widget source.

### Rule for the next plan
Preserve the parent widget's RTK Query cache source for connected child views, or send the TASK back to architect to add an explicit cache-args/line prop contract before coding. `ESCALATE`

### Suggested agent-prompt change (for a human to apply)
File: coder.md · Section: Integration contract implementation · Add: "For connected child views that read a selected item from RTK Query, prove they read the same producer cache as the parent/widget; do not hard-code alternate endpoint args, and return FAIL-DESIGN to architect if props cannot identify the producer cache."

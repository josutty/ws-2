# Reflection: TASK-007 — commitbar-cycle-summary-contract
Trigger: 2nd FAIL-MECH on same TASK: reviewer found P0 data-contract/spec mismatch in `src/features/submit-indent/ui/CommitBar.tsx` — missing TASK-required `useGetDealerCycleSummaryQuery` / `entities/cycle` status-refresh integration and submitted summary lacks contracted vertical context.
Upstream agent: coder

## What was missed
`CommitBar` implemented the submitted state from props only and did not consume the required `useGetDealerCycleSummaryQuery` status-refresh endpoint. Its submitted summary rendered `Submitted · {lineCount} lines · {julyUnits} units for July` instead of the contracted `{vertical} submitted · {n} lines · {n} units for July`.

## Where it should have been caught
Coder's pre-handoff contract sweep should have checked TASK-007's Integration contract and Components sections against the implementation, specifically every named hook and every literal summary format for `CommitBar`.

## Guard that catches it next time
Before handoff, run a TASK-contract grep and record it in history: `rg "useGetDealerCycleSummaryQuery|vertical.*submitted|submitted.*vertical" src/features/submit-indent/ui/CommitBar.tsx`; dispatch is incomplete unless the required hook import/call and submitted vertical text are present.

## Rule for the next plan
Verify every connected component against each named server-data hook and each exact TASK text template before marking GREEN.

## Suggested agent-prompt change (for a human to apply)
File: coder.md · Section: Pre-handoff checks · Add: "For connected components, grep each TASK Integration contract hook and each Components-section text template in the touched files; paste the grep evidence into task history, and do not hand off if any required hook or template is absent."

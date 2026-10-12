# Reflection: TASK-015 — page-server-data-none-cache-read
Trigger: HANDOFF: status=FAIL-MECH next=orchestrator task=TASK-015 reason="P0 data-contract violation in src/pages/home/ui/HomePage.tsx owned by coder: page directly reads RTK Query cache data despite TASK-015 server-data-none contract"
Upstream agent: coder

## What was missed
`src/pages/home/ui/HomePage.tsx` still imports RTK Query API objects and `useAppSelector`, then reads cached server data inside page-owned export modal wiring. This violates TASK-015's `Server data: none directly` contract: the page may compose widgets and keep only `exportOpen` local state, while widget slices own all server-data hooks and 4-state handling.

## Where it should have been caught
Coder's Integration contract implementation check should have compared the repair against TASK-015's Integration contract before handoff, especially the `Server data: none directly`, `Client state: exportOpen`, and `No fetch/axios/useState for server data` bullets. The loop failed because each repair addressed the previous symptom (`hard-coded export data`, then `direct server fetching`) without re-running a contract-level negative check for any page-owned server-data reads.

## Guard that catches it next time
Before coder handoff, run and record `rg "cycleApi|indentLineApi|baseApi|\.endpoints\.|use[A-Z].*Query|useAppSelector|select\(" src/pages/home/ui/HomePage.tsx` and require no hits except unrelated text inside comments. The next coder dispatch must also inspect `ExportModal` wiring and prove it receives only page-local open/close state or props supplied by composed widget boundaries, not data pulled from RTK Query cache in the page.

## Rule for the next plan
Keep `HomePage` composition-only: remove page-owned RTK Query/cache reads and pass export data through an owned widget/feature boundary or return FAIL-DESIGN if TASK-015 lacks a legal data source for `ExportModal`.

## Suggested agent-prompt change (for a human to apply)
File: coder.md · Section: Integration contract implementation · Add: "For any page TASK whose Integration contract says `Server data: none directly`, grep the page for RTK Query hooks/selectors, endpoint API imports, `useAppSelector`, and `.select(` before handoff; if a modal/action needs server data, use an owned widget/feature boundary or return FAIL-DESIGN instead of reading cache in the page."
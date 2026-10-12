# Reflection: TASK-016 — grid-detail-button-accessible-name-contract
Trigger: HANDOFF: status=BLOCKED-DESIGN next=orchestrator task=TASK-016 reason="WorkbookPage implemented and focused lint clean, but unit GREEN requires changing out-of-scope IndentGrid detail button accessible name from 'Open details for <FERT>' to the test-expected 'ⓘ'"
Upstream agent: test-engineer

## What was missed
`WorkbookPage.test.tsx` encoded the grid detail control's accessible name as the visible glyph `ⓘ`, while the implemented `IndentGrid` exposes the same button as `Open details for <FERT>`. The page wiring works only if the upstream contract decides whether the public test should query the descriptive accessible name or the widget contract must intentionally expose the glyph as its accessible name.

## Where it should have been caught
Test-engineer should have checked TASK-016's page test selectors against the dependency widget contract from TASK-014 and the completed `IndentGrid.test.tsx` accessibility selector before handing the page test to coder.

## Guard that catches it next time
For page tests that click a composed child control, require a selector-contract row: `child component`, `control`, `role`, `accessible name source`, and `owning TASK/test`. Block RED handoff if the page test's role/name selector does not match the child component's own focused test or documented a11y contract.

## Rule for the next plan
Align composed-page tests to the child component's public accessible-name contract before dispatching the page coder.

## Suggested agent-prompt change (for a human to apply)
File: test-engineer.md · Section: Page composition tests · Add: "When a page test interacts with a child component control, derive the `getByRole` name from the child component's TASK contract or existing focused test, and record the owning TASK/test beside the selector; do not invent a different accessible name from the visual glyph."
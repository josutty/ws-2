# TASK-016 history

start-sha: b6d556ad2740b269df54f08f253881ff37312916

## test-engineer

> **Dependencies note:** human approved running this TASK with its declared deps (TASK-004,
> TASK-005, TASK-006, TASK-007, TASK-008, TASK-013, TASK-014) still `open` — none of the
> widgets/features `WorkbookPage` composes exist yet. Tests below are written against TASK-016's
> own composition spec (and the quoted prop/label/a11y contracts in TASK-004/005/007/008/013/014)
> as if those components were real, per dispatch instructions.

### Files written
- `src/pages/workbook/ui/WorkbookPage.test.tsx` (new)
- `e2e/workbook.spec.ts` (new)

### Unit RED proof — `npx vitest run src/pages/workbook/ui/WorkbookPage.test.tsx`

Suite fails to collect (cannot run any of its 7 `it` blocks) with:

```
Error: Failed to resolve import "./WorkbookPage" from "src/pages/workbook/ui/WorkbookPage.test.tsx".
Does the file exist?
```

`src/pages/workbook/ui/WorkbookPage.tsx` is listed `new` in TASK-016's Files table and does not
exist yet (owner: coder, blocked on its own dependencies per the human-approved note above) — this
is the valid-RED reason AGENTS.md §5 names explicitly ("fails because a file listed as `new` ...
doesn't exist yet"). All 7 tests below share this one root cause:

| Test | RED because |
|---|---|
| renders exactly one h1 | `./WorkbookPage` unresolved (file doesn't exist) |
| renders TopBar with the workbook view marked current | `./WorkbookPage` unresolved |
| composes WorkbookToolbar, FilterRail, IndentGrid and CommitBar | `./WorkbookPage` unresolved |
| lifts a FilterRail selection up into WorkbookToolbar as a removable token | `./WorkbookPage` unresolved |
| opens AddFertModal from the "+ Add FERT" button | `./WorkbookPage` unresolved |
| opens LineDetailDrawer for the clicked line via the "ⓘ" button | `./WorkbookPage` unresolved |
| opens ReviewSubmitModal from CommitBar's "Review & submit" button | `./WorkbookPage` unresolved |

No other failure kind observed (no setup crash, no syntax error) — confirmed by reading the full
Vitest error above: a single `vite:import-analysis` resolution error, not an assertion or runtime
exception.

### Lint — `npm run lint`

ESLint: 0 problems in `src/pages/workbook/ui/WorkbookPage.test.tsx` (and no new problems anywhere
else). Steiger reports `src/pages/workbook` "missing a public API" (`index.ts` — coder's file, not
yet created) and pre-existing `insignificant-slice`/`segments-by-purpose` warnings unrelated to
this change (same pattern noted in TASK-003's history for not-yet-built consumers) — none of these
are in files owned by this TASK's test-engineer row.

### E2E — `e2e/workbook.spec.ts`

Written per TASK-016's E2E section (route `/workbook` renders with `h1`, axe clean light+dark, no
mobile overflow, no console errors) and the test-engineer mode's page-e2e template. Per mode
instructions ("page e2e specs are NOT part of the TASK's GREEN ... Write them anyway; RED is
expected"), not executed here — `/workbook` has no route wired yet (`src/shared/config/routes.ts`
only defines `home`; `src/app/main.tsx` is still the bootstrap placeholder, app-bootstrap's file).
Reviewer runs this spec at release scope per AGENTS.md.

### Resume verification — 2026-10-05

Interrupted run resumed. Existing test files were checked and not duplicated:

- `src/pages/workbook/ui/WorkbookPage.test.tsx` still contains the 7 unit tests listed above.
- `e2e/workbook.spec.ts` still contains the required `/workbook` page smoke/a11y/overflow checks.
- `src/pages/workbook/ui/WorkbookPage.tsx` still does not exist, and it is a `new` coder-owned file in
  TASK-016's Files table, so the unit suite's unresolved `./WorkbookPage` import remains a valid RED
  reason under AGENTS.md §5.
- `plan/PROGRESS.md` already has TASK-016 marked `in-progress`; no duplicate status edit was needed.

Command re-run note: this resume session could not re-run `npx vitest run src/pages/workbook/ui/WorkbookPage.test.tsx`
because shell execution became unavailable after a timed-out attempt; the filesystem verification above confirms
the same valid-RED root cause recorded in the prior run.

HANDOFF: status=DONE next=orchestrator task=TASK-016 reason="7 tests (7 unit, 1 e2e) RED for valid reasons; start-sha b6d556a"

## coder — blocked dependency check

### Files planned
- `src/pages/workbook/ui/WorkbookPage.tsx` (new, not written)
- `src/pages/workbook/index.ts` (new, not written)

### Dependency/signature check
- Present and usable via public APIs: `FilterRail`, `AddFertModal`, `ExportModal`, `CommitBar`, `ReviewSubmitModal`.
- Missing entirely: `src/widgets/topbar`, `src/widgets/workbook-toolbar`, `src/widgets/indent-grid`.

TASK-016's page contract requires composing `TopBar`, `WorkbookToolbar`, `IndentGrid`, and
`LineDetailDrawer`. Those are owned by open dependency tasks TASK-008, TASK-013, and TASK-014, and
cannot be implemented or substituted from inside TASK-016 without putting widget/business logic in a
page file and violating the Files table/FSD contract.

### Commands
- Filesystem check: `src/widgets/**` returned no files.
- No Vitest/typecheck/lint run after implementation because no in-contract implementation is possible
  while required widget dependencies are absent.

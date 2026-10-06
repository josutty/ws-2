# TASK-011 history

- test-engineer start-sha: unavailable — `git rev-parse HEAD` failed because `git` is not available in this environment.

## test-engineer RED evidence

Command: `npx vitest run src/widgets/accuracy-summary --reporter=verbose --testTimeout=10000 --hookTimeout=10000`

- IndentAccuracyCard renders a labelled loading skeleton and settles after accuracy history loads — RED because `./IndentAccuracyCard` cannot be resolved; file is listed `new` in TASK-011.
- IndentAccuracyCard renders average accuracy, bias label, summary pill, and accessible sparkline text from the query — RED because `./IndentAccuracyCard` cannot be resolved; file is listed `new` in TASK-011.
- IndentAccuracyCard expands and collapses the report card panel from the toggle — RED because `./IndentAccuracyCard` cannot be resolved; file is listed `new` in TASK-011.
- IndentAccuracyCard shows an error banner with a working retry when accuracy history fails — RED because `./IndentAccuracyCard` cannot be resolved; file is listed `new` in TASK-011.
- AccuracyReportPanel renders a labelled loading skeleton and settles after outlet report data loads — RED because `./AccuracyReportPanel` cannot be resolved; file is listed `new` in TASK-011.
- AccuracyReportPanel renders one outlet row per dealer outlet plus the total row in the by-outlet view — RED because `./AccuracyReportPanel` cannot be resolved; file is listed `new` in TASK-011.
- AccuracyReportPanel switches to by-vehicle data and renders FERT rows — RED because `./AccuracyReportPanel` cannot be resolved; file is listed `new` in TASK-011.
- AccuracyReportPanel calls onSelectFert when a FERT row is clicked — RED because `./AccuracyReportPanel` cannot be resolved; file is listed `new` in TASK-011.
- AccuracyReportPanel calls onSelectFert when Enter is pressed on a FERT row — RED because `./AccuracyReportPanel` cannot be resolved; file is listed `new` in TASK-011.
- AccuracyReportPanel shows the by-vehicle empty state when no FERTs have offtake history — RED because `./AccuracyReportPanel` cannot be resolved; file is listed `new` in TASK-011.
- AccuracyReportPanel shows an error banner with a working retry when accuracy history fails — RED because `./AccuracyReportPanel` cannot be resolved; file is listed `new` in TASK-011.

Lint: `npm run lint` fails only on pre-existing `tools/check-install.mjs` `@typescript-eslint/no-unused-expressions`; TASK-011 test files are not reported after removing an unused import.

Git: commit not created because `git` is not available in this environment (`git status --short` and `git rev-parse HEAD` both fail with CommandNotFoundException).

## coder implementation plan

- Files: `src/widgets/accuracy-summary/ui/IndentAccuracyCard.tsx`, `src/widgets/accuracy-summary/ui/AccuracyReportPanel.tsx`, `src/widgets/accuracy-summary/index.ts`; append-only updates to this history file.
- Hooks/selectors: `useGetDealerAccuracyHistoryQuery({ groupBy })` from `@entities/accuracy`; `useListDealerOutletsQuery({})` from `@entities/dealer`; no Redux selectors.
- Teardown: none — only RTK Query subscriptions and local component state.

## coder GREEN evidence

- Implemented only coder-owned TASK-011 files: `IndentAccuracyCard.tsx`, `AccuracyReportPanel.tsx`, and `index.ts`.
- `npx vitest run src/widgets/accuracy-summary --reporter=verbose --testTimeout=10000 --hookTimeout=10000` — PASS: 2 files, 11 tests.
- `npx eslint src/widgets/accuracy-summary/ui/IndentAccuracyCard.tsx src/widgets/accuracy-summary/ui/AccuracyReportPanel.tsx src/widgets/accuracy-summary/index.ts` — PASS.
- `npm run typecheck` — out-of-scope FAIL: pre-existing/future `src/pages/workbook/ui/WorkbookPage.test.tsx` imports missing `./WorkbookPage` (not in TASK-011 Files table).
- `npm run lint` — out-of-scope FAIL: existing `tools/check-install.mjs` `@typescript-eslint/no-unused-expressions` errors; no TASK-011 production files reported before ESLint stopped.
- `npx steiger ./src` — out-of-scope FAILs in pre-existing/future files, plus TASK-011 test files importing generated model types (test-engineer-owned); TASK-011 production files had no Steiger errors.
- `npm test` — out-of-scope FAIL: 25 files/142 tests passed, blocked only by missing future `src/pages/workbook/ui/WorkbookPage` imported by its test.
- `git status --short` / commit — skipped per human decision because `git` remains unavailable (`CommandNotFoundException`).

## reviewer evidence

- Git/scope: `git status --short` failed with `CommandNotFoundException`; applied the human-approved Git-unavailable exception. Checked TASK-011 files against the Files table manually; production files are limited to `IndentAccuracyCard.tsx`, `AccuracyReportPanel.tsx`, and `index.ts`; tests are the two listed test files.
- A `npm run typecheck` — out-of-scope FAIL only: `src/pages/workbook/ui/WorkbookPage.test.tsx` imports missing future `./WorkbookPage` (TASK-016/not in TASK-011).
- B `npm run lint` — out-of-scope FAIL before TASK files: existing `tools/check-install.mjs` `@typescript-eslint/no-unused-expressions`; task-local ESLint via `./node_modules/.bin/eslint ...accuracy-summary...` PASS. `steiger ./src` still reports known public-api sidestep errors in generated-model imports, including TASK-011 test files owned by test-engineer; TASK-011 production files have no Steiger error.
- C `npm test` — out-of-scope FAIL only: 25 files passed / 142 tests passed; failed suite is `src/pages/workbook/ui/WorkbookPage.test.tsx` missing future `./WorkbookPage`.
- Task-local tests: `npx vitest run src/widgets/accuracy-summary --reporter=verbose --testTimeout=10000 --hookTimeout=10000` PASS: 2 files, 11 tests.
- D `npm run coverage -- src/widgets/accuracy-summary --reporter=verbose --testTimeout=10000 --hookTimeout=10000` — task scope report only: TASK-011 files `src/widgets/accuracy-summary/ui` show 97.35% statements/lines, 87.59% branches, 92.85% functions; command exits nonzero only because global/features/widgets thresholds include unexercised out-of-task files.
- E `npm run build` — out-of-scope FAIL only: build starts with `tsc --noEmit` and hits the same missing future `src/pages/workbook/ui/WorkbookPage` import.
- Backup static checks on `src/widgets/accuracy-summary`: no `style=`, hex/rgb, fetch/axios/baseApi, raw palette classes, `console.`, `.skip/.only/.todo`, or sensitive-number pattern hits.
- Manual spec: props match (`tolerancePct`, optional `onSelectFert`); RTK Query hooks match the contract; loading/error+retry/empty/success/collapsed/expanded outlet and vehicle states are rendered and covered; errors use `role="alert"`; skeletons use `role="status"`/`aria-busy`; sparkline has an accessible text equivalent; vehicle rows expose keyboard/click selection through named buttons; no stories required for connected widgets; teardown is n/a.
- Verdict: PASS with documented out-of-scope gate failures and visual rendering / real-browser console / Redux DevTools still pending human Gate 3.

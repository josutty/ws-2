start-sha: unavailable (git command failed: git not found in PATH)

## test-engineer RED evidence

- Set `plan/PROGRESS.md` TASK-010 status to `in-progress`.
- `npx vitest run src/widgets/plan-performance/ui/IndentVsDemandCard.test.tsx src/widgets/plan-performance/ui/StockAgingCard.test.tsx --reporter=verbose` exited 1.
- IndentVsDemandCard.test.tsx suite: valid RED because Vite cannot resolve `./IndentVsDemandCard`, a `new` production file listed in TASK-010 Files table.
- StockAgingCard.test.tsx suite: valid RED because Vite cannot resolve `./StockAgingCard`, a `new` production file listed in TASK-010 Files table.
- `npm run lint -- src/widgets/plan-performance/ui/IndentVsDemandCard.test.tsx src/widgets/plan-performance/ui/StockAgingCard.test.tsx` exited 1 before TASK files due pre-existing `tools/check-install.mjs` `@typescript-eslint/no-unused-expressions` errors.
- `npm exec -- eslint src/widgets/plan-performance/ui/IndentVsDemandCard.test.tsx src/widgets/plan-performance/ui/StockAgingCard.test.tsx` exited 0 for the touched test files.
- Commit not created: `git` is unavailable in this environment (`git` command not found) and the workspace is reported as not a git repo.

## component-generator implementation

- Added `AbpPlaceholderCard` as a static presentational card with the TASK copy and semantic token classes.
- Added `AbpPlaceholderCard.stories.tsx` covering the permanent `not-available` state.
- `npx vitest run src/widgets/plan-performance --reporter=verbose` exited 1: waiting on coder-owned `IndentVsDemandCard.tsx` and `StockAgingCard.tsx` new files (Vite TS2307/import resolution failures); no component-generator-owned tests exist for AbpPlaceholderCard.
- `npm run typecheck` exited 1 only with TS2307 for missing `src/pages/workbook/ui/WorkbookPage`, `IndentVsDemandCard`, and `StockAgingCard` new files owned outside this component-generator row.
- `npm exec -- eslint src/widgets/plan-performance/ui/AbpPlaceholderCard.tsx src/widgets/plan-performance/ui/AbpPlaceholderCard.stories.tsx` exited 0.
- `npm run lint` exited 1 on pre-existing `tools/check-install.mjs` `@typescript-eslint/no-unused-expressions` errors; the component files lint clean.
- `npm run build-storybook` exited 0 (initial 120s attempt timed out; rerun with 300s completed).
- Public API export not appended because `src/widgets/plan-performance/index.ts` is a coder-owned new row in TASK-010 and this dispatch restricts component-generator to its own rows plus history.
- Commit not created: `git` is unavailable in this environment (`git` command not found) and the workspace is reported as not a git repo.

## coder implementation plan

- Files: `IndentVsDemandCard.tsx`, `StockAgingCard.tsx`, `DemandMixCard.tsx`, `src/widgets/plan-performance/index.ts`; append-only history.
- Hooks/selectors: `useListDealerIndentLinesQuery({ size: 50, includeReference: true })` from `@entities/indent-line`; no client selectors.
- Teardown: none — RTK Query unsubscribes automatically.

## coder implementation evidence

- Implemented the coder-owned connected cards and public API exports: `IndentVsDemandCard`, `StockAgingCard`, `DemandMixCard`, and `src/widgets/plan-performance/index.ts`.
- Used only `useListDealerIndentLinesQuery({ size: 50, includeReference: true })` for server data; no client selectors or manual teardown were needed.
- `npx vitest run src/widgets/plan-performance/ui/IndentVsDemandCard.test.tsx src/widgets/plan-performance/ui/StockAgingCard.test.tsx --reporter=verbose` exited 0: 2 files / 13 tests passed.
- `npm exec -- eslint src/widgets/plan-performance/ui/IndentVsDemandCard.tsx src/widgets/plan-performance/ui/StockAgingCard.tsx src/widgets/plan-performance/ui/DemandMixCard.tsx src/widgets/plan-performance/index.ts` exited 0.
- `npm run build-storybook` exited 0.
- `npm run typecheck` exited 1 on pre-existing/open TASK-016 `src/pages/workbook/ui/WorkbookPage.test.tsx` TS2307 for missing `./WorkbookPage` (outside TASK-010 Files table).
- `npm run lint` exited 1 only on pre-existing `tools/check-install.mjs` `@typescript-eslint/no-unused-expressions` errors after TASK-010 files linted clean.
- `npm test` exited 1 after 21 files / 125 tests passed; the only failing suite was open TASK-016 `src/pages/workbook/ui/WorkbookPage.test.tsx` missing `./WorkbookPage` (outside TASK-010 Files table).
- `git diff --name-only` and commit were not run successfully because `git` is unavailable in PATH and the workspace is not a git repo.

## reviewer task-scope review

- Manual spec check passed for TASK-010 revision 3: all Files-table components/tests/story/public API exist; connected cards use `useListDealerIndentLinesQuery({ size: 50, includeReference: true })`, render loading/error+retry/empty/success, and do not use fetch/axios/useState for server data; `AbpPlaceholderCard` is static not-available copy with a Storybook story.
- `npm run typecheck` exited 1 only on later open TASK-016 `src/pages/workbook/ui/WorkbookPage.test.tsx` TS2307 for missing `./WorkbookPage` (outside TASK-010 scope note).
- `npm run lint` exited 1 only on documented baseline `tools/check-install.mjs` `@typescript-eslint/no-unused-expressions` errors; focused TASK-010 ESLint exited 0.
- `npx vitest run src/widgets/plan-performance --reporter=verbose` exited 0: 4 files / 19 tests passed.
- `npm test -- --reporter=basic` exited 1 after 23 files / 131 tests passed; the only failed suite was later open TASK-016 `src/pages/workbook/ui/WorkbookPage.test.tsx` missing `./WorkbookPage` (outside TASK-010 scope note).
- `npx vitest run src/widgets/plan-performance --coverage --reporter=default` exited 1 on global/project thresholds, but TASK-010 files reported 100% statements/lines/functions and >=95% branches; task-scope coverage is report-only.
- `npm run build` exited 1 because it runs `tsc --noEmit` and hits the same later open TASK-016 `WorkbookPage` TS2307, not TASK-010.
- `npm run build-storybook` exited 0; Vite emitted existing large chunk warnings over 500 kB in Storybook vendor/docs/axe chunks (P2 note, not TASK-010-specific).
- Backup static checks via repository grep found no `style=`, raw hex/rgb in TSX, fetch/axios/baseApi in TSX, raw palette classes, console usage, `@app` imports below app, or skipped/only/todo tests in `src`; the sensitive-data regex matched UUID-like mock IDs in `mocks/factories/currentUser.ts` and `mocks/factories/outlet.ts`, which are outside TASK-010 and not card/SSN-shaped TASK-010 data.
- Scope/author branch checks and qartez checks could not be completed in this environment: workspace is reported as not a git repository and qartez is not available; TASK-010 visible touched files match the Files table plus progress/history.
- Set `plan/PROGRESS.md` TASK-010 status to `done`.

## test-engineer revision 3 coverage update

- `git rev-parse HEAD` exited 1: `git` is unavailable in PATH, so start-sha remains unavailable for this environment.
- Added revision-3 tests for `DemandMixCard.test.tsx`: loading skeleton with pending handler release, `indentLinesServerError` banner + retry, `indentLinesEmpty` standard empty treatment, and success coverage for total FERT count, Runner/Repeater/Stranger stacked-bar accessible segment counts, and the required segment-count caption.
- Added revision-3 tests for `AbpPlaceholderCard.test.tsx`: permanent `not-available` heading/status copy, dealer-level ABP explanation, and absence of retry/loading/data-driven controls.
- `npx vitest run src/widgets/plan-performance/ui/DemandMixCard.test.tsx src/widgets/plan-performance/ui/AbpPlaceholderCard.test.tsx --reporter=verbose` exited 1: `AbpPlaceholderCard.test.tsx` passed 2/2; `DemandMixCard` loading, error+retry, and empty tests passed; `DemandMixCard` success test is valid RED on assertion because the implemented component does not render the required caption `Runner 2 lines, Repeater 1 line, Stranger 1 line.`.
- `npx vitest run src/widgets/plan-performance --reporter=verbose` exited 1: 18/19 TASK-010 unit tests passed; the only failure is the valid RED `DemandMixCard` caption assertion above.
- `npm run lint -- src/widgets/plan-performance/ui/DemandMixCard.test.tsx src/widgets/plan-performance/ui/AbpPlaceholderCard.test.tsx` exited 1 before TASK files due pre-existing `tools/check-install.mjs` `@typescript-eslint/no-unused-expressions` errors.
- `npm exec -- eslint src/widgets/plan-performance/ui/DemandMixCard.test.tsx src/widgets/plan-performance/ui/AbpPlaceholderCard.test.tsx` exited 0 for the touched test files.
- Commit not created: `git` is unavailable in this environment (`git` command not found) and the workspace is reported as not a git repo.

## coder revision 3 fix evidence

- Files: `src/widgets/plan-performance/ui/DemandMixCard.tsx`; append-only history.
- Hooks/selectors: unchanged `useListDealerIndentLinesQuery({ size: 50, includeReference: true })` from `@entities/indent-line`; no client selectors.
- Teardown: none — RTK Query unsubscribes automatically.
- Added the required DemandMixCard caption summarizing Runner/Repeater/Stranger line counts with singular/plural line copy.
- `npx vitest run src/widgets/plan-performance --reporter=verbose` exited 0: 4 files / 19 tests passed.
- `npm exec -- eslint src/widgets/plan-performance/ui/IndentVsDemandCard.tsx src/widgets/plan-performance/ui/StockAgingCard.tsx src/widgets/plan-performance/ui/DemandMixCard.tsx src/widgets/plan-performance/ui/AbpPlaceholderCard.tsx src/widgets/plan-performance/index.ts` exited 0.
- `npm run typecheck` exited 1 only on later open TASK-016 `src/pages/workbook/ui/WorkbookPage.test.tsx` TS2307 for missing `./WorkbookPage` (outside TASK-010 Files table, documented scope note).
- `npm run lint` exited 1 only on documented baseline `tools/check-install.mjs` `@typescript-eslint/no-unused-expressions` errors; TASK-010 files linted clean via scoped ESLint.
- `npm test` exited 1 after 23 files / 131 tests passed; the only failing suite was later open TASK-016 `src/pages/workbook/ui/WorkbookPage.test.tsx` missing `./WorkbookPage` (outside TASK-010 Files table, documented scope note).
- `npm run build-storybook` exited 0.
- `git diff --name-only` and commit were not run successfully because `git` is unavailable in PATH and the workspace is not a git repo.

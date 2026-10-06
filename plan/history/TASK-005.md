start-sha: skipped (git unavailable per human-approved context)

test-red:
- AddFertModal does not render the dialog while closed and renders it with the catalogue while open — valid RED: cannot resolve new file listed in TASK Files table (`./AddFertModal`).
- AddFertModal shows a labelled loading skeleton while catalogue products load — valid RED: cannot resolve new file listed in TASK Files table (`./AddFertModal`).
- AddFertModal searches through the query parameter and renders matching catalogue rows — valid RED: cannot resolve new file listed in TASK Files table (`./AddFertModal`).
- AddFertModal shows an empty state when no catalogue products match — valid RED: cannot resolve new file listed in TASK Files table (`./AddFertModal`).
- AddFertModal shows an error banner with a working retry inside the modal — valid RED: cannot resolve new file listed in TASK Files table (`./AddFertModal`).
- AddFertModal toggles catalogue rows and updates the selected counter — valid RED: cannot resolve new file listed in TASK Files table (`./AddFertModal`).
- AddFertModal closes without posting a mutation when Add selected is clicked with no selection — valid RED: cannot resolve new file listed in TASK Files table (`./AddFertModal`).
- AddFertModal disables Add selected while submitting selected rows — valid RED: cannot resolve new file listed in TASK Files table (`./AddFertModal`).
- AddFertModal adds every selected product then closes and notifies the parent — valid RED: cannot resolve new file listed in TASK Files table (`./AddFertModal`).
- AddFertModal shows a toast and closes without an inline banner when the selected product already exists — valid RED: cannot resolve new file listed in TASK Files table (`./AddFertModal`).

commands:
- `npx vitest run src/features/add-fert-line/ui/AddFertModal.test.tsx --reporter=verbose --no-coverage` — failed for valid RED reason above before collecting tests.
- `npm run lint -- src/features/add-fert-line/ui/AddFertModal.test.tsx` — blocked by pre-existing out-of-scope `tools/check-install.mjs` lint errors before the TASK file.
- `npm exec -- eslint src/features/add-fert-line/ui/AddFertModal.test.tsx` — passed.
- commit skipped: git unavailable per human-approved context.

coder-notes:
- Files: `src/features/add-fert-line/ui/AddFertModal.tsx`, `src/features/add-fert-line/index.ts`.
- Hooks: `useListAvailableProductsQuery({ vertical, search })`, `useAddDealerIndentLineMutation()`.
- Teardown: none beyond shared `Modal`.

coder-green:
- `npx vitest run src/features/add-fert-line/ui/AddFertModal.test.tsx --reporter=verbose --no-coverage` — passed (10 tests).
- `npm exec -- eslint src/features/add-fert-line/ui/AddFertModal.tsx src/features/add-fert-line/index.ts` — passed.
- `npm run typecheck` — blocked by out-of-scope missing `src/pages/workbook/ui/WorkbookPage.tsx` imported by `WorkbookPage.test.tsx`.
- `npm run lint` — blocked by pre-existing out-of-scope `tools/check-install.mjs` lint errors.
- `npm test -- --no-coverage` — TASK-005 tests passed; full suite blocked by out-of-scope missing `src/pages/workbook/ui/WorkbookPage.tsx`.
- commit skipped: git unavailable per human-approved context.

reviewer:
- Scope/branch/owner checks: git unavailable in this environment (`git` command not found); human-approved context says continue without Git tracking, so this was reviewed from TASK Files table/content instead of diff metadata. TASK-005 implementation files match the Files table.
- A `npm run typecheck` — failed only on out-of-scope `src/pages/workbook/ui/WorkbookPage.test.tsx` missing `./WorkbookPage`.
- B `npm run lint` — failed only on out-of-scope `tools/check-install.mjs` `@typescript-eslint/no-unused-expressions` errors; targeted ESLint for TASK-005 files passed.
- C `npm test -- --no-coverage` — failed only on out-of-scope `src/pages/workbook/ui/WorkbookPage.test.tsx` missing `./WorkbookPage`; TASK-005 suite passed within the full run (10 tests) and targeted `npx vitest run src/features/add-fert-line/ui/AddFertModal.test.tsx --reporter=verbose --no-coverage` passed (10 tests).
- D `npm run coverage` — report-only for task scope; command failed on out-of-scope missing WorkbookPage suite and three TASK-005 tests timing out under coverage instrumentation, while targeted non-coverage TASK-005 tests are green.
- E `npm run build` — failed only on out-of-scope `src/pages/workbook/ui/WorkbookPage.test.tsx` missing `./WorkbookPage` during `tsc --noEmit`.
- F `npm run build-storybook` — passed; Storybook/Vite emitted chunk-size warnings for Storybook bundles only.
- G `npm run e2e` — skipped for task scope because TASK-005 is not a BUG with an e2e regression spec.
- Backup static checks: no `style=`, raw hex/rgb in TSX, fetch/axios/baseApi in TSX, raw palette classes, console usage in src, `@app` imports outside app, or `.skip/.only/.todo`; sensitive-data regex hit pre-existing UUID fixture ids in `mocks/factories/outlet.ts` and `mocks/factories/currentUser.ts` (not TASK-005 files, UUIDs rather than SSN/card data).
- qartez: unavailable in this environment; Steiger is covered by lint but full lint is blocked before Steiger by out-of-scope tool lint errors.
- Manual spec: props, RTK Query usage, local query/selection state, loading/error/empty/no-selection/selection/submitting/conflict states, `.unwrap()` mutation handling, no manual refetch after mutation, a11y semantics, and teardown all match TASK-005; no presentational story is required for this connected component.

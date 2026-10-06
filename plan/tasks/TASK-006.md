---
id: TASK-006
status: open
revision: 1
depends-on: [TASK-001]
created: 2026-10-01
---

# TASK-006: features/export-indent — ExportModal

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/features/export-indent/ui/ExportModal.tsx | connected | coder | new |
| src/features/export-indent/lib/buildIndentCsv.ts | lib | coder | new |
| src/features/export-indent/index.ts | public api | coder | new |
| src/features/export-indent/ui/ExportModal.test.tsx | test | test-engineer | new |
| src/features/export-indent/lib/buildIndentCsv.test.ts | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: none directly fetched — `buildIndentCsv` is a typed selector over already-loaded
  `entities/indent-line`, `entities/dealer`, `entities/cycle` data (D25, client global state per
  api-integration-points.md — not a fetch). The composing widget/page passes that already-loaded
  data in as props; this feature never calls a query hook itself.
- Client state: `open`/`closed` (D24) lives in the parent (widget/page), not here.
- Mutations: none.
- Errors: n/a (no network call); clipboard failures are handled locally (see states below).
- No fetch/axios/useState for server data (AGENTS.md §3) — `buildIndentCsv` takes typed data as
  arguments, it does not fetch.

## Components

### ExportModal (connected)
- Props: `open: boolean; lines: IndentLine[]; dealer: DealerReference; cycle: CurrentCyclePreview | DealerCycleSummary;
  scope: 'all' | 'filtered'; onClose: () => void`
  (wraps shared `Modal`; `lines`/`dealer`/`cycle` types from `src/shared/api/generated/models.ts`)
- Shows: notice that in production this downloads a file; read-only textarea with CSV content (34
  columns, FERT Code through Added) built via `buildIndentCsv(lines, dealer, cycle, scope)`;
  Close / "Copy to clipboard" buttons.
- Interactions: "Copy to clipboard" uses `navigator.clipboard.writeText`; on success shows toast
  "Copied to clipboard"; on throw (API unavailable/denied) shows toast "Select the text and copy"
  and does not crash.
- A11y: uses shared `Modal`'s dialog semantics; textarea has a visible label.

### buildIndentCsv (lib, not a component)
- Signature: `buildIndentCsv(lines: IndentLine[], dealer: DealerReference, cycle: CurrentCyclePreview | DealerCycleSummary, scope: 'all' | 'filtered'): string`
- Pure function — no I/O, no `Date.now()` (accepts cycle data as an argument instead), returns the
  34-column CSV string verbatim per components.md's ExportModal description.

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| default | ExportModal | subtitle shows scope (all lines vs filtered count), CSV preview populated |
| copy-success | ExportModal | toast "Copied to clipboard" |
| copy-fallback | ExportModal | toast "Select the text and copy" (clipboard API throws) |

## Tests (test-engineer writes RED first)
- buildIndentCsv.test.ts: returns a header row with all 34 columns; one data row per input line;
  `scope='filtered'` includes only the passed-in (already-filtered) `lines`; deterministic output
  for the same seeded fixture input (no snapshot test — assert specific cell values, per AGENTS.md
  §5 "No snapshot tests").
- ExportModal.test.tsx: renders CSV content from `buildIndentCsv`; "Copy to clipboard" (clipboard
  mocked to resolve) → toast "Copied to clipboard"; clipboard mocked to reject → toast "Select the
  text and copy"; Close calls `onClose`.
- Coverage target: 80% (features).

## Styling
Semantic tokens only. No `dark:`.

## Teardown
- None beyond `Modal`'s own (TASK-001).

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/features/export-indent
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

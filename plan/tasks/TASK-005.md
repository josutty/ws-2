---
id: TASK-005
status: open
revision: 1
depends-on: [TASK-001]
created: 2026-10-01
---

# TASK-005: features/add-fert-line — AddFertModal

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/features/add-fert-line/ui/AddFertModal.tsx | connected | coder | new |
| src/features/add-fert-line/index.ts | public api | coder | new |
| src/features/add-fert-line/ui/AddFertModal.test.tsx | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: `useListAvailableProductsQuery({ vertical, search })` (own `api/addFertApi.ts`,
  store-architect-owned) for the catalogue checklist.
- Client state: `selected: Set<string>` and `query: string` are local component state (D24 modal
  open/closed lives in the parent widget, not here).
- Mutations: `useAddDealerIndentLineMutation` — on confirm, appends each selected code; invalidates
  `IndentLine` LIST (per api-integration-points.md) so the grid refetches.
- Errors: inline modal error banner on mutation failure; 409 (`ERR_LINE_EXISTS`, per
  `mocks/scenarios.ts` → `addIndentLineConflict`) → toast "already on your indent" + close modal
  instead of the inline banner (per api-integration-points.md).
- No fetch/axios/useState for server data (AGENTS.md §3).

## Components

### AddFertModal (connected)
- Props: `open: boolean; vertical: 'lmd' | 'hd'; onClose: () => void; onAdded?: () => void`
  (wraps shared `Modal`)
- Shows: notice that these are codes not ordered in the last 12 months and will be flagged for the
  ASM; search box; checklist of matching catalogue codes (code, description, tonnage, fuel,
  segment); "`{n}` selected" / "None selected" counter; Cancel / "Add selected" buttons.
- Interactions: confirming appends each selected code as a new zero-quantity, `added:true` line and
  closes the modal; "Add selected" with no selection is a no-op-equivalent close (matches source UX
  `no-selection` state, not disabled — per ui-states.md).
- A11y: uses shared `Modal`'s dialog semantics/focus trap; checklist rows are real `<button>`s
  with `aria-pressed` reflecting selection.
- Loading: catalogue list shows a loading skeleton (`aria-hidden`, labelled container) while
  `useListAvailableProductsQuery` is in flight; "Add selected" is disabled while the mutation is
  pending and shows a loading state (AGENTS.md §12 Forms).

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| closed/open | AddFertModal | standard modal open/close |
| loading | AddFertModal | catalogue skeleton while `listAvailableProducts` loads |
| error | AddFertModal | banner + retry inside the modal (`availableProductsServerError` scenario) |
| empty/no-match | AddFertModal | "No matching code in the catalogue." (`availableProductsEmpty` / search with no hits) |
| no-selection | AddFertModal | footer "None selected", "Add selected" closes with no changes |
| selection-made | AddFertModal | footer "`{n}` selected" |
| submitting | AddFertModal | "Add selected" disabled + loading while mutation in flight |
| conflict (409) | AddFertModal | toast "already on your indent", modal closes (`addIndentLineConflict` scenario) |

## Tests (test-engineer writes RED first)
- AddFertModal.test.tsx: renders catalogue rows from `useListAvailableProductsQuery`; search
  filters the list and calls the query with the new `search` param; toggling a row updates the
  selected counter; `availableProductsEmpty` scenario → "No matching code in the catalogue.";
  `availableProductsServerError` → banner + retry; confirming with a selection calls
  `addDealerIndentLine` then closes the modal and calls `onAdded`; `addIndentLineConflict` scenario
  → toast + modal closes without an inline banner; "Add selected" with no selection closes without
  calling the mutation.
- Coverage target: 80% (features).

## Styling
Semantic tokens only. No `dark:`.

## Teardown
- None beyond `Modal`'s own (TASK-001) — no additional timers/listeners owned here.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/features/add-fert-line
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

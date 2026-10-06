---
id: TASK-009
status: open
revision: 1
depends-on: [TASK-001]
created: 2026-10-01
---

# TASK-009: widgets/home-summary — IndentProgressCard, VerticalsSummaryCard, NeedsAttentionCard

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/widgets/home-summary/ui/IndentProgressCard.tsx | connected | coder | new |
| src/widgets/home-summary/ui/VerticalsSummaryCard.tsx | connected | coder | new |
| src/widgets/home-summary/ui/NeedsAttentionCard.tsx | connected | coder | new |
| src/widgets/home-summary/index.ts | public api | coder | new |
| src/widgets/home-summary/ui/IndentProgressCard.test.tsx | test | test-engineer | new |
| src/widgets/home-summary/ui/VerticalsSummaryCard.test.tsx | test | test-engineer | new |
| src/widgets/home-summary/ui/NeedsAttentionCard.test.tsx | test | test-engineer | new |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: `useGetDealerCycleSummaryQuery` (`entities/cycle`, all three cards);
  `useListDealerIndentLinesQuery` (`entities/indent-line`, `NeedsAttentionCard`'s flag counts are
  derived client-side from the loaded line list — no dedicated aggregate endpoint).
- Client state: none.
- Mutations: none.
- Errors: every card handles 4 states (loading · error with retry · empty · success) per
  AGENTS.md §3. `IndentProgressCard`/`VerticalsSummaryCard` degrade on `cycleSummaryServerError`;
  `NeedsAttentionCard` degrades on `indentLinesServerError`.
- No fetch/axios/useState for server data (AGENTS.md §3).

## Components

### IndentProgressCard (connected)
- Props: `onContinue: () => void; onReviewSubmit: () => void` (data sourced from
  `useGetDealerCycleSummaryQuery`)
- Shows: "Your July indent — `{vertical}`" title, "`{entered}` of `{total}` lines entered", total
  units for the month, status pill, progress meter, auto-submit reminder w/ cutoff, Continue and
  Review & submit buttons.
- A11y: progress meter gets `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/
  `aria-valuemax` (fixes the components.md-noted gap — source was a plain `<i>` bar).

### VerticalsSummaryCard (connected)
- Props: `onOpen: (vertical: string) => void`
- Shows: one row per vertical — name, status pill (`not-started`/`in-progress`/`submitted`),
  "`{entered}` / `{total}`" fraction, "Open →" button.

### NeedsAttentionCard (connected)
- Props: `onShow: (flag: string) => void`
- Shows: one row per non-zero attention flag (no-entry, aged-stock >180D, ±20% off last cycle,
  added-this-cycle), count/label/"Show →"; empty → "✓ Nothing needs your attention right now."

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| loading | all three | skeleton, `aria-hidden` with a labelled container |
| error | all three | banner + retry (standard, not drawn in source UX) |
| not-submitted / submitted | IndentProgressCard | meter + amber pill / green pill |
| not-started / in-progress / submitted | VerticalsSummaryCard | red / amber / green pill per row |
| empty | NeedsAttentionCard | "✓ Nothing needs your attention right now." |
| populated | NeedsAttentionCard | rows with count/label/Show → |

## Tests (test-engineer writes RED first)
- IndentProgressCard.test.tsx: loading skeleton then renders entered/total/units from the query;
  `cycleSummaryServerError` → banner + retry; progress meter has `role="progressbar"` with correct
  `aria-valuenow`; Continue/Review buttons call their callbacks.
- VerticalsSummaryCard.test.tsx: renders a row per vertical with the right status pill; "Open →"
  calls `onOpen` with the vertical name.
- NeedsAttentionCard.test.tsx: `indentLinesEmpty` scenario (0 flags) → "Nothing needs your
  attention"; populated flags render rows; "Show →" calls `onShow` with the flag key.
- Coverage target: 80% (widgets).

## Styling
Semantic tokens only. No `dark:`.

## Teardown
- None — RTK Query hooks unsubscribe automatically.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/widgets/home-summary
```

## Reflections applied
- none (no entries under notes/memory/reflections/)

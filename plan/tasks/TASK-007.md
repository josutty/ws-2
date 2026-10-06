---
id: TASK-007
status: open
revision: 2
depends-on: [TASK-001]
created: 2026-10-01
---

# TASK-007: features/submit-indent — CommitBar, ReviewSubmitModal

> **Open item (G4, flagged not blocking):** `reopenDealerIndent` (CommitBar's "Reopen" button) has
> an endpoint (mock/proposed) and a slice placement, but `plan/generated/backend-gaps.md` notes
> `inputs/fsd-spec.md` §5 never documents a dealer-initiated "reopen before cutoff" step (only tier
> lock/auto-submit/escalation). Per architect dispatch this TASK **includes** the Reopen button and
> its mocked endpoint call (do not drop the UI), but the business rule — whether reopening is
> self-service or requires ASM approval — is **unconfirmed**. Reviewer/human: confirm this before
> treating the current contract (client-initiated, no approval step, per
> `reopenDealerIndent`'s spec) as final. If the rule changes, this TASK needs a new revision.

## Files
| Path | Kind | Owner | new/edit |
|---|---|---|---|
| src/features/submit-indent/ui/CommitBar.tsx | connected | coder | edit (must preserve submitted-state cycle-summary refresh/reopen behaviour) |
| src/features/submit-indent/ui/ReviewSubmitModal.tsx | connected | coder | edit (remove non-schema `SubmitPreview` field casts; take view-local counts as props) |
| src/features/submit-indent/index.ts | public api | coder | edit (preserve exports) |
| src/features/submit-indent/ui/CommitBar.test.tsx | test | test-engineer | edit (preserve existing coverage) |
| src/features/submit-indent/ui/ReviewSubmitModal.test.tsx | test | test-engineer | edit (assert prop-sourced notice counts; no ad-hoc preview fields) |

Agents may touch ONLY these files. Reviewer diffs against this table.

## Integration contract
- Server data: `useGetDealerCycleSummaryQuery` (`entities/cycle`; CommitBar status refresh and
  ReviewSubmitModal subtitle/dealer context), own `useGetDealerSubmitPreviewQuery`
  (`api/submitApi.ts`, ReviewSubmitModal only, disabled until the modal opens).
- Client state: none — `filtered`, `filteredLineCount`, and `addedLineCount` are view-local values
  passed down by the composing workbook/page from `widgets/indent-grid`/line-list derived state, not
  a slice and not part of `SubmitPreview`.
- Mutations: own `useSubmitDealerIndentMutation`, `useReopenDealerIndentMutation` — both invalidate
  `DealerCycleSummary` + `IndentLine` LIST (per api-integration-points.md).
- Errors: `getDealerSubmitPreview` failure → banner + retry inside `ReviewSubmitModal`, Submit
  button disabled until loaded; `submitDealerIndent` failure → inline modal error banner, modal
  stays open; 409 (`submitConflict` scenario, already submitted/past cutoff) → banner + "Cancel"
  only (Submit button removed, not just disabled); `reopenDealerIndent` failure → toast; 409
  (`reopenConflict` scenario, past cutoff) → toast + Reopen button disabled.
- No fetch/axios/useState for server data (AGENTS.md §3).

## Components

### CommitBar (connected)
- Props: `submitted: boolean; lineCount: number; julyUnits: number; totalUnits: number;
  missingCount: number; filtered: boolean; onReviewSubmit: () => void; onViewSent: () => void`
  (matches components.md; `onReopen` handled internally via `useReopenDealerIndentMutation`, not a
  prop, since this component owns that mutation directly per the integration contract above)
- Shows (not-submitted): line count, July units, Jul–Sep total, count of lines with no entry (if
  any), filtered-view note when active, "Review & submit" button. Shows (submitted): check mark,
  "`{vertical}` submitted · `{n}` lines · `{n}` units for July", "View what was sent" and "Reopen"
  buttons.
- Interactions: "Reopen" calls `useReopenDealerIndentMutation` directly (see G4 note above) —
  disabled + loading while pending, disabled permanently on a 409.

### ReviewSubmitModal (connected)
- Props: `open: boolean; onClose: () => void; filtered?: boolean; filteredLineCount?: number;
  addedLineCount?: number; onReviewMissing?: () => void`.
- Shows: subheading from `DealerCycleSummary` (cycle label · dealer; omit vertical unless a schema
  field is later added); conditional notices — filtered-view warning (only when `filtered` and
  `filteredLineCount` are present), missing-entries warning (from `SubmitPreview.warnings` with
  "Review them first" link that closes the modal and jumps to the `noentry` filter via
  `onReviewMissing`), added-lines notice (only when `addedLineCount > 0`, prop-sourced); summary
  (Lines plus every `SubmitPreview.totals.months[]` label/value; no delta/% row because the schema
  exposes no delta field); closing note (next-tier recipient and `reopenUntil` deadline); Cancel /
  "Submit indent".
- Interactions: "Submit indent" calls `useSubmitDealerIndentMutation`; on success closes the modal
  and shows a confirmation toast; button shows `loading` and is disabled while submitting (AGENTS.md
  §12 Forms — source UX draws this synchronously with no loading state, a gap `ui-states.md`
  itself flags; this TASK implements the standard, not the source gap).

### ReviewSubmitModal data contract (revision 2)
| UI text/field | Source hook/prop | Schema field/path | Fallback/absent behavior |
|---|---|---|---|
| Modal subtitle cycle/dealer | `useGetDealerCycleSummaryQuery` | `DealerCycleSummary.cycleLabel`, `DealerCycleSummary.dealer.name` | Hide subtitle until loaded; do not invent vertical text because `SubmitPreview.vertical` is a backend gap. |
| Filtered-view notice count | `filtered`, `filteredLineCount` props | n/a — view-local filtered row count, not server schema | If `filtered !== true` or `filteredLineCount` is absent/0, do not render the notice. |
| Missing-entry notice count/copy | `useGetDealerSubmitPreviewQuery` | `SubmitPreview.warnings[].code === 'LINES_WITHOUT_ENTRY'`, `.message`, `.lineCount` | If no warning with that code, do not render the notice. |
| Added-lines notice count | `addedLineCount` prop | n/a — view-local count of dealer-added lines; `IndentLine.addedByMe` remains a backend gap | If absent/0, do not render the notice. Never read `preview.addedLineCount`. |
| Lines summary | `useGetDealerSubmitPreviewQuery` | `SubmitPreview.lines` | Hide summary until preview loaded. |
| Month totals summary | `useGetDealerSubmitPreviewQuery` | `SubmitPreview.totals.months[].label`, `.value` | Render only returned months; do not add delta/% vs last cycle. |
| Recipient | `useGetDealerSubmitPreviewQuery` | `SubmitPreview.recipient` | Hide closing note until preview loaded. |
| Resubmit/reopen deadline | `useGetDealerSubmitPreviewQuery` | `SubmitPreview.reopenUntil` | Render formatted `<time dateTime={reopenUntil}>`; no generic "resubmit deadline" placeholder. |

## UI states (from analysis/ui-states.md)
| State | Rendered by | Expected UI |
|---|---|---|
| not-submitted-no-missing | CommitBar | stat row + "Review & submit" |
| not-submitted-some-missing | CommitBar | additional amber "`{n}` with no entry" stat |
| filtered-view | CommitBar | amber filtered-total note |
| submitted | CommitBar | check mark, submitted summary, "View what was sent" + "Reopen" |
| reopen-pending | CommitBar | Reopen disabled + loading |
| reopen-conflict (409) | CommitBar | toast, Reopen disabled (`reopenConflict` scenario) |
| clean | ReviewSubmitModal | only summary block + closing note |
| filtered-warning | ReviewSubmitModal | amber notice re: full-indent submission, using prop `filteredLineCount` |
| missing-entries-warning | ReviewSubmitModal | amber notice + "Review them first" link |
| added-lines-notice | ReviewSubmitModal | info notice re: ASM flag, using prop `addedLineCount` |
| submitting | ReviewSubmitModal | Submit button loading + disabled (AGENTS.md §12, not in source) |
| preview-error | ReviewSubmitModal | banner + retry, Submit disabled until loaded |
| submit-conflict (409) | ReviewSubmitModal | banner + Cancel-only (`submitConflict` scenario) |

## Tests (test-engineer writes RED first)
- CommitBar.test.tsx: not-submitted renders stat row and "Review & submit"; `missingCount > 0`
  shows the amber stat; `filtered=true` shows the filtered note; `submitted=true` renders check
  mark + "View what was sent"/"Reopen"; clicking Reopen calls `reopenDealerIndent`;
  `reopenConflict` scenario → toast + Reopen disabled.
- ReviewSubmitModal.test.tsx: renders summary from `getDealerSubmitPreview`; `submitPreviewServerError`
  scenario → banner + retry, Submit disabled; filtered notice renders from `filtered` +
  `filteredLineCount` props without adding `filteredLineCount` to the preview fixture; missing notice
  renders from `SubmitPreview.warnings`; added notice renders from `addedLineCount` prop without
  adding `addedLineCount` to the preview fixture; "Submit indent" calls `submitDealerIndent`, shows
  loading+disabled while pending, closes on success with a confirmation toast; `submitConflict`
  scenario → banner, only Cancel shown (Submit button absent); regression guard: grep the production
  and test files for `preview.filteredLineCount|preview.addedLineCount|SubmitPreviewWithViewFlags` and
  expect no matches.
- Coverage target: 80% (features).

## Styling
Semantic tokens only. No `dark:`.

## Teardown
- None beyond `Modal`'s own (TASK-001) inside ReviewSubmitModal.

## Dry-run (DoD)
```bash
npm run typecheck && npm run lint && npx vitest run src/features/submit-indent
```

## Reflections applied
- notes/memory/reflections/TASK-007-review-submit-modal-preview-schema-contract.md: ESCALATE: Map every connected-component summary value and closing-note phrase to an explicit API schema field or remove/revise the UI requirement before dispatch, then require implementation evidence that each mapped field is rendered.
- notes/memory/reflections/TASK-007-review-submit-modal-preview-schema-contract.md: Guard recurrence — if `filteredLineCount`/`addedLineCount` are absent from generated schema, the TASK must list an explicit prop/hook source and owner; revision 2 makes both view-local props and forbids ad-hoc `SubmitPreview` extensions.

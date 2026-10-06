# Reflection: TASK-007 — review-submit-modal-preview-schema-contract
Trigger: FAIL-DESIGN from reviewer: ReviewSubmitModal contract requires delta/% vs last cycle, but SubmitPreview/CycleTotals API schema has no such field; modal also omits exact resubmit deadline/vertical spec.
Upstream agent: architect

## What was missed
TASK-007 required `ReviewSubmitModal` to render `delta/% vs last cycle` and a closing note with resubmit deadline/vertical context, but the contracted `SubmitPreview`/`CycleTotals` schema did not expose delta or percent fields and the TASK did not specify the exact resubmit deadline/vertical copy/source fields.

## Where it should have been caught
Architect's Integration contract and Components template sections should have reconciled every required UI datum with a named API field or prop before assigning implementation, especially the ReviewSubmitModal summary row and closing-note fields.

## Guard that catches it next time
Add a machine-checkable TASK data-contract table for each connected component row: `UI text/field | source hook | schema field/path | fallback/absent behavior`; the task is invalid if any required rendered datum has an empty schema field/path.

## Rule for the next plan
ESCALATE: Map every connected-component summary value and closing-note phrase to an explicit API schema field or remove/revise the UI requirement before dispatch, then require implementation evidence that each mapped field is rendered.

## Recurred
Trigger: HANDOFF: status=FAIL-MECH next=orchestrator task=TASK-007 reason="ReviewSubmitModal renders the closing note as `You can reopen until the resubmit deadline` without the TASK/API-provided `reopenUntil` resubmit deadline value; did not update plan/PROGRESS.md to done."
Upstream agent: coder

`ReviewSubmitModal.tsx` still rendered generic closing-note copy instead of the API-provided `reopenUntil` resubmit deadline value. The coder pre-handoff contract sweep should have checked the TASK Components section's closing-note requirement against the mapped `SubmitPreview.reopenUntil` field and a focused grep/test assertion for `reopenUntil`-derived text.

Guard that catches it next time: before handoff, run and record `rg "reopenUntil|resubmit deadline|You can reopen until" src/features/submit-indent/ui/ReviewSubmitModal.tsx src/features/submit-indent/ui/ReviewSubmitModal.test.tsx`; the generic placeholder phrase must have no production hit, and at least one assertion must prove the rendered note includes the fixture deadline value.

## Recurred
Trigger: HANDOFF: status=FAIL-DESIGN task=TASK-007 reason="ReviewSubmitModal filtered/added notice counts rely on non-schema SubmitPreview fields with no TASK-provided source"
Upstream agent: architect

`ReviewSubmitModal` was tasked to render filtered-view and added-lines notices with counts, but the only contracted data source (`SubmitPreview`) has `status`, `lines`, `totals`, `warnings`, `recipient`, and `reopenUntil` only; the TASK did not provide a prop or schema field for `filteredLineCount`/`addedLineCount`, leading implementation/tests to cast ad-hoc fields onto the generated type.

Guard that catches it next time: before dispatch, validate the TASK's connected-component data-contract table by grepping generated schema for every named source path (for this case, `filteredLineCount|addedLineCount` in `src/shared/api/generated/schema.d.ts` must either match or the TASK must list an explicit prop/hook source and owner); any missing path makes the TASK BLOCKED-DESIGN.

## Suggested agent-prompt change (for a human to apply)
File: architect.md · Section: TASK template / Integration contract · Add: "For each connected component, include a data-contract table mapping every required rendered value and exact text phrase to a source hook plus schema field/path; mark the TASK BLOCKED-DESIGN if the API schema lacks a required field."

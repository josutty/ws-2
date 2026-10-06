# UI States — Demand Planning Workbench (Phase 0)

Screen analyzed: **dealer** (`inputs/ux/dealer.html`). Per AGENTS.md §3/§5, every server-data
component gets loading · error · empty · success rows even where the static HTML (which has no
real network calls) doesn't draw them — those rows are marked "standard (not drawn)".

| Component | State | Trigger | Expected UI | In design? |
|---|---|---|---|---|
| LoginForm | default | initial load | empty identifier/password fields pre-filled with demo values, no errors shown | yes |
| LoginForm | invalid — unknown identifier | submit with unrecognised dealer code/email | `#fId` gets `.invalid`, shows "⚠ We don't recognise that dealer code." | yes |
| LoginForm | invalid — wrong password | submit with recognised id, wrong password | `#fPw` gets `.invalid`, shows "⚠ Incorrect password. 4 attempts left before the account locks." | yes |
| LoginForm | submitting | after valid submit | standard (not drawn) — HTML signs in synchronously with no request/spinner | standard (not drawn) |
| LoginForm | error — request failed | auth service unreachable | standard (not drawn) | standard (not drawn) |
| TopBar | default | app loaded | logo, nav, cycle/cutoff/status segments, user chip | yes |
| TopBar | cutoff imminent | countdown < some threshold | same style (`warnv` class always applied to clock) — no distinct urgent state drawn | standard (not drawn) — only one visual treatment shown regardless of time remaining |
| TopBar | submitted | vertical locked | "Status: **Submitted**" in green (`okv` class) replaces "Status: **Not submitted**" | yes |
| IndentProgressCard | loading | dashboard data not yet fetched | standard (not drawn) — HTML shows `—` placeholders only before first render, not a real loading state | standard (not drawn) |
| IndentProgressCard | error | dashboard data fetch fails | standard (not drawn) | standard (not drawn) |
| IndentProgressCard | not-submitted | default | meter bar, "Not submitted" pill (amber), Continue/Review buttons enabled | yes |
| IndentProgressCard | submitted | after submit | "Submitted" pill (`p-ok`, green) | yes (derived from `submitted[vert]`, same card markup) |
| VerticalsSummaryCard | not-started | vertical has 0 entered lines | "Not started" pill (`p-crit`, red) | yes |
| VerticalsSummaryCard | in-progress | some lines entered, not submitted | "In progress" pill (`p-warn`, amber) | yes |
| VerticalsSummaryCard | submitted | vertical locked | "Submitted" pill (`p-ok`, green) | yes |
| NeedsAttentionCard | empty | all attention counts are 0 | "✓ Nothing needs your attention right now." | yes |
| NeedsAttentionCard | populated | one or more flags > 0 | list of rows, each with count/label/"Show →" | yes |
| IndentVsDemandCard / StockAgingCard / DemandMixCard / IndentAccuracyCard | loading | first load | standard (not drawn) | standard (not drawn) |
| IndentVsDemandCard / StockAgingCard / DemandMixCard / IndentAccuracyCard | error | data fetch fails | standard (not drawn) | standard (not drawn) |
| IndentVsDemandCard / StockAgingCard / DemandMixCard / IndentAccuracyCard | empty | no lines in scope (e.g. 0 FERTs) | standard (not drawn) — HTML always assumes a non-empty catalogue | standard (not drawn) |
| IndentVsDemandCard / StockAgingCard / DemandMixCard / IndentAccuracyCard | success | data present | full KPI display as documented in components.md | yes |
| AbpPlaceholderCard | not-available | always, at Dealer level | "Not yet available" + explanation | yes (permanent state for this persona, not a loading/error state) |
| IndentAccuracyCard | collapsed | default | "▸ View report card" button, panel hidden | yes |
| AccuracyReportPanel | expanded — by outlet | toggle on, default view | table of 3 outlets + "All three outlets" total row | yes |
| AccuracyReportPanel | expanded — by vehicle | "By vehicle" toggle | top 25 FERTs (by current filter) with offtake history, clickable rows | yes |
| AccuracyReportPanel | empty — by vehicle | no FERTs with offtake history in current filter | "No lines with offtake history in this filter." | yes |
| RollupTable | default grouping | Home loads | grouped by Sub-vertical, all collapsible bands at their default mode | yes |
| RollupTable | row expanded | user clicks ▶ on a group row | child FERT rows shown with ▼, indented | yes |
| RollupTable | band summary / full / off | user clicks a band header | column(s) for that band show 1 summary col / all cols / none | yes |
| FilterRail | expanded | default | full filter list, footer with Clear all/Save view | yes |
| FilterRail | collapsed | user clicks collapse toggle | narrow stub with count badge + vertical "Filters" label; on ≤900px this also becomes an overlay | yes |
| FilterRail | filters active | ≥1 filter selected | count badge visible on both `railCnt`/`stubCnt` | yes |
| FilterRail | no saved views | default | saved-views dropdown hidden entirely | yes |
| FilterRail | saved views present | after "Save view" used at least once | saved-views `<select>` shown at top of rail | yes |
| MultiSelectFilter | closed | default | button shows "All" (dim) or current selection summary | yes |
| MultiSelectFilter | open | user clicks the filter button | popover with search + option list open | yes |
| MultiSelectFilter | option disabled | an option's count would be 0 under current other filters | option omitted from the list entirely (filtered out), unless already selected | yes |
| MultiSelectFilter | no match | search term matches nothing | "No match" empty state in the popover | yes |
| WorkbookToolbar | no filters | default | no filter-token chips shown, just search/add/export/density/columns | yes |
| WorkbookToolbar | filters active | ≥1 filter or search term set | token chips rendered, trailing "Clear all" button appears | yes |
| ColumnsPopover | closed | default | hidden | yes |
| ColumnsPopover | open | "☷ Columns" clicked | presets + per-band Hide/Summary/Full controls shown | yes |
| IndentGrid | loading | first load | standard (not drawn) — HTML renders synchronously from a hardcoded array | standard (not drawn) |
| IndentGrid | error | data fetch fails | standard (not drawn) | standard (not drawn) |
| IndentGrid | empty | active filters match 0 lines | "No lines match these filters" panel + "Clear all filters" button; grid table itself hidden | yes — `#gEmpty` / `#grid{display:none}` |
| IndentGrid | success — editable | vertical not yet submitted | quantity inputs enabled, focusable, editable | yes |
| IndentGrid | success — locked | vertical submitted | quantity inputs `disabled`, shown with muted background | yes — `cell()`'s `dis` flag |
| IndentGrid | row — no entry | a line has all-zero quantities and wasn't added by the user | amber left-edge accent (`tr.noentry`) | yes |
| IndentGrid | row — added by dealer | line added via AddFertModal | purple left-edge accent (`tr.isadd`) + "ADDED" tag in the id cell | yes |
| IndentGrid | cell — carry-forward hint | a weekly cell (W1–W4) has a non-zero prior value | small "was `{n}`" caption under the input | yes |
| IndentGrid | sorted | a column header clicked | sort arrow shown, ascending/descending toggle on repeat click, third click clears sort | yes |
| IndentGrid | band collapsed/expanded | band header clicked | see ColumnsPopover — same underlying `bandMode` | yes |
| CommitBar | not-submitted, no missing | all lines have an entry | stat row (lines/July units/Jul–Sep total) + "Review & submit" | yes |
| CommitBar | not-submitted, some missing | ≥1 line has no entry | additional amber stat: "`{n}` with no entry" | yes |
| CommitBar | filtered view | active filters applied | amber note: "Filtered-view total · submission still includes all `{n}` lines" | yes |
| CommitBar | submitted | vertical locked | green check, submitted summary text, "View what was sent" + "Reopen" buttons | yes |
| LineDetailDrawer | closed | default | `display:none`, scrim hidden | yes |
| LineDetailDrawer | open | info button or accuracy-row click | slide-over panel + scrim shown | yes |
| LineDetailDrawer | segment mismatch | dealer segment ≠ Eicher segment for that FERT | amber "differs" label next to Eicher segment | yes |
| LineDetailDrawer | aged stock present | `s90`/`sOver` > 0 | amber (`.w`) / red (`.c`) value color, paired with the band label text | yes |
| AddFertModal | closed / open | `openAdd()` / `closeM('addM')` | standard modal open/close | yes |
| AddFertModal | no selection | default on open | footer shows "None selected", "Add selected" still clickable but is a no-op-equivalent (closes modal) | yes |
| AddFertModal | selection made | ≥1 catalogue row toggled on | footer shows "`{n}` selected" | yes |
| AddFertModal | no match | search term matches nothing in catalogue | "No matching code in the catalogue." | yes |
| ExportModal | default | opened from Home or Workbook | subtitle shows scope (all lines vs filtered count), CSV preview populated | yes |
| ExportModal | copy success | "Copy to clipboard" clicked, clipboard API available | toast "Copied to clipboard" | yes |
| ExportModal | copy fallback | clipboard API throws | toast "Select the text and copy" | yes |
| ReviewSubmitModal | clean | no filters, no missing, no added lines | only the summary block + closing recipient note shown | yes |
| ReviewSubmitModal | filtered warning | active filters applied when opened | amber notice: submission still includes all lines, not just the filtered view | yes |
| ReviewSubmitModal | missing-entries warning | ≥1 line has no entry | amber notice with count + "Review them first" link (closes modal, jumps to `noentry` filter) | yes |
| ReviewSubmitModal | added-lines notice | ≥1 line added via AddFertModal | info notice: "`{n}` line(s) added by you this cycle — flagged for your ASM" | yes |
| ReviewSubmitModal | submitting | "Submit indent" clicked | standard (not drawn) — synchronous in the prototype, no spinner/disabled-while-submitting shown (gap vs AGENTS.md §12 Forms: "button shows loading and is disabled while submitting") | standard (not drawn) / gap |
| Toast | hidden | default / after ~2.6s | `opacity:0`, `pointer-events:none` | yes |
| Toast | shown | any `toast(message)` call | slides up, opaque, auto-dismisses | yes |
| Grid cell paste | multi-cell paste | tab/newline-delimited clipboard content pasted into a quantity cell | values fill across the pasted rectangle, toast confirms count pasted | yes |
| Grid FERT-filter paste | paste into the FERT filter search box | comma/newline-delimited code list pasted | matching codes get selected in bulk, toast confirms count selected + count not found | yes |

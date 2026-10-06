# Components — Demand Planning Workbench (Phase 0)

Screens analyzed: **dealer** (`inputs/ux/dealer.html`) — the Dealer persona's Indent Workbook.
This is the only UX file present under `inputs/ux/`. The FSD (§6.1, Attachment A) names four more
linked prototype files (ASM/CSM, RSM, VH, ISO) and five further standalone workbenches (COCO, IB,
IS, NPI, EPS) that are **not** in this workspace — the HTML's own `personaFiles` map (bottom of
the `<script>`) confirms they are separate files this screen redirects to. Their screens, states
and data needs cannot be enumerated from this input set; see Open questions.

Enumeration source: `node tools/list-html-elements.mjs inputs/ux/dealer.html` (114 lines, indices
0–113) plus manual read of the HTML for `<style>`, media queries, and the inline `<script>` (data
model, render functions, event handlers) which generates everything the static extractor can't see
(grid rows, drawer content, modal bodies, filter options are all built at runtime from JS arrays).

---

### LoginForm
- Screens: dealer (×1)
- Source: `#login form` (dealer.html)
- Role hint: page
- Shows: title ("Sign in"), instruction text, two fields (dealer code/email, password), inline
  field errors, primary "Sign in" button, secondary "Sign in with VECVNet SSO" button, "Forgot
  password?" link, support-contact footnote. Page background also shows the current cycle name and
  countdown ("S&OP-1A · Jul 2026 · Indent closes 15 Jul, 23:59 IST").
- Props (domain level):
  - `onSubmit: (credentials: { identifier: string; password: string }) => void`
  - `onSsoSignIn: () => void`
  - `error?: 'unknown-identifier' | 'wrong-password'` — drives which field shows its error text
- Interactions: submit → sign in (extractor #8); SSO button → sign in (#9, same handler in this
  prototype); "Forgot password?" → placeholder toast, no real flow built (#6).
- A11y: `<label for>` on both fields; errors are plain `<span>` next to the field, not wired to
  `aria-invalid`/`aria-describedby` in the source HTML — flag for the team's WCAG 2.2 AA bar
  (AGENTS.md §12 Forms) since this is a gap versus the standard, not a deliberate choice.
- Responsive: single column, centered card, `max-width:400px`; not otherwise specified.
- Reuses: Button, Input
- Exists: —

### TopBar
- Screens: dealer (×1, persistent across Home and Workbook views)
- Source: `.topbar` (dealer.html) — contains `#nvHome`, `#nvWb`, `#tbClock`, `#tbState`, theme and
  sign-out icon buttons, user chip
- Role hint: layout
- Shows: logo, nav buttons (Home, Indent workbook), current cycle + name ("S&OP-1A · Jul 2026"),
  cutoff countdown ("Closes in `3d 4h`"), submission status ("Status: Not submitted" / "Submitted"),
  theme toggle, user name + code + role chip, sign-out.
- Props:
  - `activeView: 'home' | 'workbook'`
  - `onNavigate: (view: 'home' | 'workbook') => void`
  - `cycle: { name: string; period: string; cutoff: Date }`
  - `status: 'not-submitted' | 'submitted'`
  - `user: { name: string; code: string; role: string; initials: string }`
  - `onToggleTheme: () => void`
  - `onSignOut: () => void`
- Interactions: nav buttons switch view; theme toggle flips light/dark; sign-out returns to login.
- A11y: theme toggle (`◐`) and sign-out (`⎋`) are icon-only buttons with a `title` attribute only —
  no `aria-label`; flag as a gap against AGENTS.md §12 ("icon-only buttons use `aria-label`").
- Responsive: at ≤900px, all status segments after the first are hidden (`.tb-status .seg:nth-
  child(n+2){display:none}`) — only the cycle name segment survives.
- Reuses: Button, Badge (status text isn't a Badge component in the HTML, just styled `<b>`/`<span>`)
- Exists: —

### PersonaSwitcher
- Screens: dealer (×1)
- Source: `#personaSel` (dealer.html)
- Role hint: — **prototype-only control, not a production component.** Its own on-screen label
  reads "Prototype control" / "Persona switching lives here, not in the product chrome", and the
  bottom `<script>` block redirects to a different static HTML file per persona
  (`VECVplan-ASM-Prototype-v1_3-updated.html`, etc.) rather than changing state in this app.
- Shows: dropdown of five personas (Dealer, ASM, RSM, VH, ISO), each mapped to a separate
  prototype file not included in this input set.
- Props: none — excluded from the real product's component inventory.
- Interactions: selecting a non-Dealer persona navigates away to a missing file (in this workspace)
  and shows "Only the Dealer experience is built in this iteration" if the target file 404s.
- A11y: has a `<label for="personaSel">`.
- Reuses: Select
- Exists: —
- Note: fsd-planner should **not** plan a real "persona switcher" feature from this — see Q6.

### HomeDashboard
- Screens: dealer (×1) — `#vHome`
- Source: `#vHome .home-inner` (dealer.html)
- Role hint: page (composition only) — assembles the cards below plus the Rollup table.
- Shows: page greeting, vertical/outlet subtitle, Export/Continue actions, then two card zones
  ("Indent progress" cards, "Summary" cards) and a "Rollup" zone.
- Props: `dealer: { name, verticals, outlets }`, slots for each card below.
- Interactions: Export (#21) opens ExportModal; "Continue indent →" (#22) navigates to Workbook.
- A11y: one `h1` (`#hGreet`); card groups use `h3` headings — heading levels don't skip.
- Responsive: cards grid `repeat(auto-fit,minmax(262px,1fr))`; `.card.lead`/`.card.full` span 2
  columns above 760px, collapse to 1 column at ≤760px.
- Reuses: IndentProgressCard, VerticalsSummaryCard, NeedsAttentionCard, IndentVsDemandCard,
  StockAgingCard, DemandMixCard, AbpPlaceholderCard, IndentAccuracyCard, RollupTable, Button

### IndentProgressCard
- Screens: dealer (×1) — lead card on Home
- Source: `.card.lead` containing `#hcTitle` (dealer.html)
- Role hint: connected
- Shows: "Your July indent — {vertical}" title, lines-entered count ("`{n}` of `{total}` lines
  entered"), total units for July, status pill (Not submitted / Submitted), progress meter bar,
  auto-submit reminder text with the cutoff date/time, Continue and Review & submit buttons.
- Props:
  - `entered: number`, `total: number`, `unitsForMonth: number`
  - `status: 'not-submitted' | 'submitted'`
  - `cutoff: Date`
  - `onContinue: () => void`, `onReviewSubmit: () => void`
- Interactions: Continue → Workbook view; Review & submit → Workbook view + opens
  ReviewSubmitModal (`setTimeout(openReview,240)`).
- A11y: progress meter (`#hcMeter`) is a plain `<i>` bar with no `role="progressbar"` / accessible
  value — gap vs AGENTS.md §12 a11y bar.
- Reuses: Button, Badge (pill)

### VerticalsSummaryCard
- Screens: dealer (×1)
- Source: `#hcVerts` (dealer.html), rendered rows via `renderHome()`
- Role hint: connected
- Shows: one row per vertical (LMD, HD) — name, status pill (Submitted / In progress / Not
  started), "`{entered}` / `{total}`" fraction, "Open →" button.
- Props: `verticals: Array<{ name: string; status: 'submitted'|'in-progress'|'not-started'; entered: number; total: number }>`, `onOpen: (vertical: string) => void`
- Interactions: "Open →" switches active vertical and navigates to Workbook.
- A11y: static rows, no table semantics (plain `div`s) — acceptable for a short KV list.
- Reuses: Button, Badge (pill)

### NeedsAttentionCard
- Screens: dealer (×1)
- Source: `#hcAttn` (dealer.html)
- Role hint: connected
- Shows: one row per non-zero attention item — count, label (e.g. "lines with no entry", "lines
  with stock over 180 days", "lines more than ±20% off last cycle", "lines you added this cycle"),
  "Show →" button. Empty state: "✓ Nothing needs your attention right now."
- Props: `items: Array<{ flag: string; count: number; label: string }>`, `onShow: (flag: string) => void`
- Interactions: "Show →" jumps to Workbook filtered to that flag.
- A11y: static list; empty-state text communicates state without color alone.
- Reuses: Button

### IndentVsDemandCard
- Screens: dealer (×1)
- Source: `.card` containing `#kIndent` (dealer.html, "Indent vs demand signal")
- Role hint: connected
- Shows: July indent total, 3-month offtake total, a pill comparing indent to monthly run-rate
  (±15% = ok, else warn/crit), last cycle's planned figure with its own comparison pill.
- Props: `julyIndent: number`, `offtakeL3: number`, `lastCyclePlan: number`
- A11y: pill color is paired with text ("+n% vs monthly run-rate") — not color-only.
- Reuses: Badge (pill)

### StockAgingCard
- Screens: dealer (×1)
- Source: `.card` containing `#kStockBar` (dealer.html, "Stock on hand by age")
- Role hint: connected
- Shows: total units on hand, units over 60 days (highlighted), a 4-segment horizontal stacked bar
  (<60D / 60–90D / 90–180D / >180D) with legend, "Show over 180 days →" button.
- Props: `stockByAge: { under60: number; d60to90: number; d90to180: number; over180: number }`
- Interactions: "Show over 180 days →" jumps to Workbook filtered to `aged180`.
- A11y: each bar segment has a `title` tooltip with the band name and count — not color-only, but
  the tooltip isn't reachable by keyboard/screen reader (a `<i>` has no accessible text) — gap.
- Reuses: Button

### DemandMixCard
- Screens: dealer (×1)
- Source: `.card` containing `#kMixBar` (dealer.html, "Demand mix — Runner / Repeater / Stranger")
- Role hint: connected
- Shows: total FERT count, a 3-segment stacked bar (Runner/Repeater/Stranger, i.e. segments R/S/D)
  with legend and a caption summarizing line counts per segment.
- Props: `mix: Array<{ segment: 'Runner'|'Repeater'|'Stranger'; units: number; lineCount: number }>`
- A11y: same tooltip-not-accessible gap as StockAgingCard.
- Reuses: —

### AbpPlaceholderCard
- Screens: dealer (×1)
- Source: `.card` containing the heading "Against ABP" (dealer.html)
- Role hint: presentational — static/explanatory, not data-driven in Phase 0 at dealer level.
- Shows: "Not yet available" + explanation: "Dealer-level ABP targets are being introduced this
  year and aren't reliable enough to score against. Your ASM sees the cluster figure."
- Props: none.
- Note: confirms ABP scoring exists one tier up (CSM/ASM), not at Dealer — consistent with FSD's
  Phase-0-vs-Phase-1 table showing ABP-adjacent alerting as Phase 1 for RSM, not mentioning ABP
  visibility for Dealer at all.

### IndentAccuracyCard
- Screens: dealer (×1)
- Source: `.card.full` containing `#kAcc` (dealer.html, "Your indent accuracy")
- Role hint: connected
- Shows: 4-cycle average accuracy %, bias % with label ("over-indent"/"under-indent"/"no bias"),
  a sparkline (one bar per of the last 4 months), a summary pill ("Within ±10%" / "Consistently
  over" / "Consistently under"), explanatory caption, "▸ View report card" toggle button.
- Props: `history: Array<{ month: string; indented: number; offtake: number }>`, `tolerancePct: number`
- Interactions: toggle button expands/collapses AccuracyReportPanel.
- A11y: sparkline bars have `title` tooltips (month/pct/indented/took) but are not keyboard-
  reachable text — same gap as the other bar charts.
- Reuses: Badge (pill), Button

### AccuracyReportPanel
- Screens: dealer (×1) — collapsible, closed by default
- Source: `#accPanel` (dealer.html)
- Role hint: connected
- Shows: a toggle between "By outlet" and "By vehicle" views; a table with one row per outlet (or
  top 25 FERTs in the current filter), each showing indent/offtake per month, an accuracy % with
  a mini bar, and a bias pill. "By vehicle" rows are clickable and jump back into the grid filtered
  to that FERT.
- Props: `view: 'outlet'|'fert'`, `rows: Array<{ name: string; code?: string; history: {month,indented,offtake}[] }>`, `onSelectFert?: (fertCode: string) => void`
- Interactions: view toggle; row click (fert view only) → filters grid to that FERT and navigates
  to Workbook.
- A11y: renders a real `<table>` with `<th>`; row click affordance (`cursor:pointer`) has no
  keyboard equivalent (no `role="button"`/`tabindex`) — gap.
- Reuses: Badge (pill)

### RollupTable
- Screens: dealer (×1)
- Source: `#rollTbl` + `#rollGb` (dealer.html, "Rollup" zone)
- Role hint: connected
- Shows: a "Group by" segmented control (Vertical, Sub-vertical, MPG, Tonnage, AC/Non-AC, Segment,
  FERT), a note of how many lines are represented (honors the Workbook's active filters, except the
  "Vertical" grouping which always shows both verticals), then a banded table: a fixed "Your indent"
  block (W1–W4, Jul/Aug/Sep, Total — always visible) plus collapsible bands (Demand mix, Current
  dealer stock, Trend — offtake, Trend — retail, Last cycle) each toggle-able off/summary/full,
  mirroring the grid's own column-band mechanism. Rows are expandable to show individual FERT lines
  within a group. Ends with a Total row.
- Props: `groupBy: 'vert'|'sv'|'mpg'|'ton'|'ac'|'seg'|'fert'`, `rows: RollupRow[]`, `bandMode: Record<string,'off'|'summary'|'full'>`
- Interactions: group-by buttons; row expand/collapse (▶/▼); band header click cycles
  summary↔full (or full↔off where there's no summary).
- A11y: real `<table>`; expand buttons have `aria-label="Expand"` regardless of state (doesn't
  flip to "Collapse" when open) — minor gap.
- Reuses: —

### FilterRail
- Screens: dealer (×1) — `#rail`
- Source: `.rail` (dealer.html)
- Role hint: connected
- Shows: collapsible sidebar; header with filter count badge and collapse toggle; one
  MultiSelectFilter block per filter key (Vertical, FERT, Sub-vertical, Demand segment, MPG model,
  Tonnage, Fuel, Cabin, FERT History, Status); saved-views dropdown (only shown once a view has
  been saved); footer with Clear all / Save view buttons. Collapsed state shows a narrow vertical
  stub with just the count and a rotated "Filters" label.
- Props: `filters: Record<FilterKey, Set<string>>`, `collapsed: boolean`, `savedViews: SavedView[]`,
  `onToggle`, `onClear`, `onSaveView`, `onApplyView`
- A11y: collapse toggle button has no `aria-label` (just `title`) and no `aria-expanded` — gap.
- Responsive: becomes an absolutely-positioned overlay panel at ≤900px rather than pushing content.
- Reuses: MultiSelectFilter, Button, Select

### MultiSelectFilter
- Screens: dealer (×1, repeated ×10 for each `FKEYS` entry: vert, fert, sv, seg, mpg, ton, fuel,
  ac, hist, flag)
- Source: `.ms` block generated by `msBlock(key)` (dealer.html) — one instance e.g. filter for
  "Sub-vertical"
- Role hint: presentational
- Shows: label + "clear" link (when active), a button showing "All" / the one selected value's
  label / "`{n}` selected", and (when open) a popover with a search box, a scrollable option list
  (each option showing its match count, disabled — hidden — at 0 unless already selected), and a
  footer with Clear + "`{n}` of `{total}`" count. The FERT variant's search box also accepts
  paste-many-codes-at-once (`onpaste`).
- Props: `label: string`, `options: Array<{ value: string; label: string; sublabel?: string; count: number }>`, `selected: Set<string>`, `onToggle: (value: string) => void`, `onSearch: (term: string) => void`
- A11y: popover option buttons are real `<button>`s; the outer popover has no `role="listbox"`/
  focus-trap — acceptable for a simple checklist pattern but worth a styling-engineer/component-
  generator decision.
- Reuses: Input, Button

### WorkbookToolbar
- Screens: dealer (×1) — `.strip` (dealer.html)
- Role hint: connected
- Shows: vertical selector (LMD/HD), search box, active-filter token chips (each removable) plus a
  trailing "Clear all", results count ("`{n}` of `{total}` lines"), "+ Add FERT" button, "Export"
  button, density toggle (Comfortable/Compact), "☷ Columns" button opening ColumnsPopover.
- Props: `vertical: 'lmd'|'hd'`, `onVerticalChange`, `query: string`, `onQueryChange`, `tokens: FilterToken[]`, `onRemoveToken`, `resultCount: number`, `totalCount: number`, `onAddFert`, `onExport`, `density: 'comfortable'|'compact'`, `onDensityChange`
- Responsive: horizontally scrollable strip (`overflow-x:auto`) rather than wrapping.
- Reuses: Select, Input, Button

### ColumnsPopover
- Screens: dealer (×1) — `#colPop` (dealer.html)
- Role hint: presentational
- Shows: preset chips (Essentials, Stock focus, Trends, Everything), then per column-band rows
  (Vehicle attributes, Current dealer stock, Opening & live POs, Pipeline, Trend — offtake,
  Trend — retail, Last cycle) each with a Hide / Summary / Full segmented control (Summary omitted
  for bands without one) and a column count.
- Props: `presets: string[]`, `activePreset: string|null`, `bands: Array<{ key, label, colCount, mode: 'off'|'summary'|'full', hasSummary: boolean }>`, `onSetPreset`, `onSetBandMode`
- Interactions: opens on "☷ Columns" click; closes on outside click.
- Reuses: Button

### IndentGrid
- Screens: dealer (×1) — `#grid` (dealer.html)
- Role hint: connected
- Shows: a dense two-row header (band-group row + column row, both sortable on the leaf row),
  sticky first column ("Vehicle" — description + FERT code + "ADDED" tag + info button) and sticky
  header; reference column bands (Vehicle attributes, Current dealer stock, Opening & live POs,
  Pipeline, Trend — offtake, Trend — retail, Last cycle) each independently hidden/summarized/
  expanded; an editable "Your indent · July 2026" band with W1–W4, Jul (calculated), Aug, Sep,
  Total (calculated) columns; a "was `{n}`" carry-forward hint under each weekly cell; a filtered/
  visible total row; an empty state ("No lines match these filters").
- Props: `rows: FertLine[]`, `columns: ActiveColumn[]`, `sort: { key: string; dir: 1|-1 } | null`,
  `submitted: boolean`, `density: 'comfortable'|'compact'`, `onEditCell: (rowId, weekIndex, value) => void`, `onSort`, `onOpenDetail: (rowId) => void`
- Interactions: click a quantity cell to edit (disabled once `submitted`); arrow-key navigation
  between cells, Ctrl/Cmd+D fills down from the row above; paste a tab/newline-delimited block from
  a spreadsheet across cells; click a band header cycles its column mode; click the "ⓘ" button
  opens LineDetailDrawer; click a row flagged `noentry`/`isadd` is visually marked (left-edge
  accent bar).
- A11y: quantity inputs are real `<input type="number">` with `min="0"`; row-state color coding
  (amber left-border for no-entry, purple for added) has no text equivalent on the row itself
  (the info drawer does explain "ADDED") — borderline gap, worth a11y review.
- Responsive: `min-width:960px` with horizontal scroll — not mobile-optimized (out of scope per
  FSD, this is a dense planning-workbook grid by design, §6.1).
- Reuses: Button, EditableQtyCell

### CommitBar
- Screens: dealer (×1) — `#commit` (dealer.html)
- Role hint: connected
- Shows (not-submitted): visible/filtered line count, July units, Jul–Sep grand total, count of
  lines with no entry (if any), a note when the view is filtered ("submission still includes all
  `{n}` lines"), "Review & submit" button. Shows (submitted): a check mark, "`{vertical}` submitted
  · `{n}` lines · `{n}` units for July", "View what was sent" and "Reopen" buttons.
- Props: `submitted: boolean`, `lineCount: number`, `julyUnits: number`, `totalUnits: number`,
  `missingCount: number`, `filtered: boolean`, `onReviewSubmit`, `onViewSent`, `onReopen`
- Reuses: Button

### LineDetailDrawer
- Screens: dealer (×1) — `#drawer` (dealer.html)
- Role hint: connected
- Shows: a right-side slide-over panel for one FERT line — vehicle attributes (dealer's own
  segment vs "Eicher segment" with a "differs" flag when they disagree, MPG model, tonnage, fuel ·
  cabin, sub-vertical), stock on hand by age band + opening stock + live POs (with a "From SAP ·
  refreshed today 06:00 IST" source line), offtake & retail trend (L3/L6/L12/LYSM side by side,
  with a "Retail feed · refreshed … IST" source line), and last-cycle comparison (planned vs
  entered vs difference, plus the weekly carry-forward breakdown).
- Props: `line: FertLine`
- Interactions: opened from the grid's info button or from AccuracyReportPanel's per-FERT rows;
  closed via its own close button, the scrim, or Escape.
- A11y: has `aria-label="Line detail"` on the `<aside>`; close button has no `aria-label` (icon "×"
  only) — gap.
- Reuses: Button

### AddFertModal
- Screens: dealer (×1) — `#addM` (dealer.html)
- Role hint: connected
- Shows: notice explaining these are codes not ordered in the last 12 months and will be flagged
  for the ASM; a search box; a checklist of matching catalogue codes (code, description, tonnage,
  fuel, segment); a "`{n}` selected" / "None selected" counter; Cancel / "Add selected" buttons.
- Props: `catalogue: CatalogueLine[]`, `selected: Set<string>`, `query: string`, `onSearch`,
  `onToggle`, `onCancel`, `onConfirm`
- Interactions: confirming appends each selected code as a new zero-quantity, `added:true` line to
  the current vertical's indent and filters the grid to "Added by me".
- Reuses: Input, Button, Modal

### ExportModal
- Screens: dealer (×1) — `#expM` (dealer.html)
- Role hint: connected
- Shows: a notice that in production this downloads a file (here shown on screen to inspect the
  shape), a read-only textarea with CSV content (34 columns — FERT Code through Added, per the
  active filter scope or all lines), Close / "Copy to clipboard" buttons.
- Props: `csvScope: string`, `csvContent: string`, `onCopy`, `onClose`
- Reuses: Button, Modal

### ReviewSubmitModal
- Screens: dealer (×1) — `#review` (dealer.html)
- Role hint: connected
- Shows: subheading (cycle · period · dealer · vertical); conditional notices — filtered-view
  warning ("Submitting sends your full indent... not just the `{n}` on screen"), missing-entry
  warning ("`{n}` lines have no entry. They go up as zero." with a "Review them first" link),
  added-lines notice ("`{n}` line(s) added by you this cycle — flagged for your ASM"); a summary
  (Lines, July W1–W4, August, September, "vs last cycle's plan for July" delta/%); a closing note
  naming the next-tier recipient and the resubmit-until deadline; Cancel / "Submit indent" buttons.
- Props: `lineCount`, `julyUnits`, `augustUnits`, `septemberUnits`, `deltaVsLastCycle`, `missingCount`, `addedCount`, `filtered: boolean`, `recipient: string`, `resubmitDeadline: Date`, `onCancel`, `onSubmit`
- Interactions: "Submit indent" locks the vertical (sets `submitted[vert]=true`), closes the modal,
  shows a confirmation toast.
- Reuses: Button, Modal

### Toast
- Screens: dealer (×1) — `#toast` (dealer.html)
- Role hint: presentational
- Shows: a single transient bottom-center message (e.g. "Copied to clipboard", "2 cells pasted
  from your spreadsheet"), auto-dismissing after ~2.6s.
- Props: `message: string | null`
- A11y: not marked `role="status"`/`aria-live` in the source — gap; toasts should be announced.
- Reuses: —

---

## Primitives (reused across the above)

### Button
- Screens: dealer (×many — `.btn` class, variants `-primary`, `-ghost`, `-quiet`, `-add`, `-sm`)
- Source: `.btn` (dealer.html, CSS block)
- Role hint: presentational
- Props: `variant: 'primary'|'ghost'|'quiet'|'add'`, `size?: 'default'|'sm'`, `disabled?: boolean`, `children`, `onClick`
- A11y: disabled state uses `opacity:.4` + `cursor:not-allowed` plus the native `disabled`
  attribute — real disabling, not color-only.

### Select
- Screens: dealer (×3 — persona switcher, vertical selector, saved-views dropdown)
- Source: native `<select>` (dealer.html, `.vsel`, `#personaSel`, saved-views `<select>`)
- Role hint: presentational

### Input
- Screens: dealer (×5+ — login fields, search boxes, quantity cells, filter search boxes)
- Source: native `<input>` (dealer.html)
- Role hint: presentational

### Badge (pill)
- Screens: dealer (×many — `.pill` class: `p-ok`, `p-warn`, `p-crit`, `p-add`)
- Source: `.pill` (dealer.html, CSS block)
- Role hint: presentational
- Props: `tone: 'ok'|'warn'|'crit'|'add'`, `children`
- A11y: tone is always paired with text, never color-only (verified per instance above).

### Modal (dialog shell)
- Screens: dealer (×3 — Review & submit, Add FERT, Export)
- Source: `.modal`/`.mbox` (dealer.html) — plain `<div>`, not a native `<dialog>`
- Role hint: presentational
- Props: `open: boolean`, `title: string`, `subtitle?: string`, `onClose`, `children`, `footer`
- A11y: no `role="dialog"`/`aria-modal`/focus trap in the source markup; Escape key does close all
  three (`document.addEventListener('keydown', ...)`) — partial a11y, gap vs AGENTS.md §12 ("dialogs
  trap focus and return it on close").

---

## Decorative (extractor lines with no separate component — styling/structure only)

| Extractor line(s) | Element | Reason |
|---|---|---|
| — | `.meter i`, `.sbar i`, `.spark i`, bar-chart `<i>` segments | Pure visual fill bars inside StockAgingCard / DemandMixCard / IndentAccuracyCard / IndentProgressCard — content documented under those components, not separate components themselves |
| — | `#scrim` (extractor #91) | Modal/drawer backdrop overlay — part of the Modal/Drawer primitive's behavior, not a component with its own content |
| — | `.zone .zr` rule lines, `<span>` separators (`.sep`) | Pure visual dividers between toolbar/zone sections |

---

## Open questions

- Q1 (client): FSD §2 Phase 0/Phase 1 table lists "Pipeline + retail trend columns" under **Phase
  1 — Adds** for the Dealer screen, but the UX already ships full Pipeline (Confirmed/FA/FC/Hot
  Inquiry) and Trend — offtake/retail column bands in the Phase 0 grid (see IndentGrid, ColumnsPopover).
  Confirm whether these ship in Phase 0 as built, or must be hidden/disabled until Phase 1.
- Q2 (client): FSD §6.5 open item says "Dealer opening FG inventory and 'as on date' inventory
  details need to be captured; not currently a field" — but LineDetailDrawer and the grid's
  "Opening & live POs" band already show "Opening stock, 1 Jul" / `openFg`. Is the FSD open item
  stale (resolved in this UX revision), or should this field not be trusted as a real source yet?
- Q3 (client): Does "Save view" (FilterRail) persist server-side per user/across sessions and
  devices, or is it session/browser-local only? Affects whether `savedViews` is server data.
- Q4 (client): FSD §6.2 states data/fields & source systems are "closed" (fully mapped by UST) but
  doesn't itemize Pipeline (Confirmed/FA/FC/Hot Inquiry) or Retail trend (L3/L6/L12/LYSM) — are
  these SAP-sourced like stock, or a different feed?
- Q5 (client): Are column-band visibility, density (Comfortable/Compact), and rail-collapsed state
  meant to persist per-user across logins, or reset each session? Not stated in the FSD.
- Q6 (client): PersonaSwitcher (`#personaSel`) is explicitly prototype-only per its own on-screen
  label and redirects to separate demo files. Confirm it should be excluded from the real product's
  navigation entirely (not planned as a feature).
- Q7 (client): FSD Open Item OI-01 (no-entry auto-submit default = prior cycle value) is still
  unconfirmed, yet IndentProgressCard's copy already asserts "Whatever is in the grid then is what
  goes up" (i.e. zero, not prior-cycle default) for untouched lines. Will this copy need to change
  once OI-01 is resolved?

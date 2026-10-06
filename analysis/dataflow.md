# Data Flow — Demand Planning Workbench (Phase 0)

Screen analyzed: **dealer** (`inputs/ux/dealer.html`). Needs are described API-neutrally (what the
UI requires, not which endpoint); params implied by UI controls (filters, search, sort) are noted.
Classification labels are exactly one of: `server read`, `server mutation`, `client global state`,
`local UI state`, `TBD`.

| # | Need | Used by | Classification | Fields seen in HTML | Notes |
|---|---|---|---|---|---|
| D1 | FERT catalogue + vehicle attributes for the dealer's own list (per vertical) | IndentGrid, FilterRail, RollupTable, ExportModal | `server read` | code, description, MPG model, tonnage, fuel, cabin (AC/Non-AC), dealer's demand segment (Runner/Repeater/Stranger), Eicher segment, sub-vertical | Two verticals shown (LMD, HD); segment mismatch (dealer vs Eicher) is a derived display, not separately stored |
| D2 | Current-cycle FERT indent quantities (M1 weekly W1–W4, M2 Aug, M3 Sep) | IndentGrid, CommitBar, ReviewSubmitModal, HomeDashboard cards, RollupTable, ExportModal | `server mutation` | per-FERT quantity per week/month | HTML holds edits purely in memory with no autosave call visible — open question whether draft edits need an autosave mutation distinct from final Submit (see dataflow note below) |
| D3 | Submission / lock status per vertical + per-tier cutoff state | TopBar, IndentProgressCard, VerticalsSummaryCard, CommitBar, IndentGrid (disables cells) | `server read` | `submitted: boolean` per vertical, cutoff datetime, cycle name/stage | Drives cell `disabled` state and all "Submitted"/"Not submitted" pills |
| D4 | Submit indent (manual, before cutoff) | ReviewSubmitModal, CommitBar | `server mutation` | vertical, full line set (all lines, even if view is filtered) | Per FSD §6.3 auto-submit also fires at cutoff server-side; this UI only models the manual path |
| D5 | Reopen a submitted indent (resubmit before cutoff) | CommitBar | `server mutation` | vertical | FSD doesn't explicitly document a dealer-initiated "reopen" — flag to fsd-planner/architect as a UX-only affordance to confirm against business rules |
| D6 | Stock on hand by age band + opening stock + live POs, per FERT | IndentGrid ("Current dealer stock", "Opening & live POs" bands), LineDetailDrawer, StockAgingCard | `server read` | <60D, 60–90D, 90–180D, >180D, opening stock (1st of month), live POs | Drawer cites "From SAP · refreshed today 06:00 IST" |
| D7 | Pipeline figures per FERT (Confirmed / FA / FC / Hot Inquiry) | IndentGrid ("Pipeline" band) | `server read` | confirmed, FA, FC, hot inquiry counts | Source system not stated in FSD §6.2 — Open question Q4 in components.md |
| D8 | Offtake trend per FERT (L3/L6/L12/LYSM) | IndentGrid ("Trend — offtake"), LineDetailDrawer, IndentVsDemandCard, AccuracyReportPanel (FERT view seed) | `server read` | offtake last-3/6/12 months, last-year-same-month | FSD §2 names this "Pipeline + retail trend columns" as a Phase 1 addition — contradicts Phase-0 UX (Q1) |
| D9 | Retail trend per FERT (L3/L6/L12/LYSM) | IndentGrid ("Trend — retail"), LineDetailDrawer | `server read` | retail last-3/6/12 months, last-year-same-month | Same Phase 0/1 boundary question as D8 |
| D10 | Prior-cycle indent value per FERT ("last cycle") | IndentGrid ("Last cycle" band), LineDetailDrawer, ReviewSubmitModal (delta calc), RollupTable | `server read` | previous month's submitted quantity, plus a weekly carry-forward breakdown shown in the drawer | FSD §2 explicitly includes "Prior cycle indent" in Phase 0 scope — consistent |
| D11 | Indent accuracy history (indent vs offtake, last 4 cycles) — by outlet and by FERT | IndentAccuracyCard, AccuracyReportPanel | `server read` | month, indented qty, offtake qty (per outlet or per FERT) | Tolerance band (±10%) appears to be a fixed business constant, not per-dealer data |
| D12 | Dealer's outlet list | AccuracyReportPanel ("By outlet" view) | `server read` | outlet name, outlet code | Three outlets shown for this dealer group |
| D13 | Catalogue of FERT codes not currently in the dealer's own list | AddFertModal | `server read` | code, description, MPG, tonnage, fuel, segment | Scoped per vertical; excludes codes the dealer already carries |
| D14 | Add a FERT to the dealer's indent (new zero-qty, flagged line) | AddFertModal → IndentGrid | `server mutation` | FERT code(s) selected | New line is flagged for the ASM per the modal's own notice text |
| D15 | S&OP cycle metadata (cycle id/name, period, cutoff datetime, next-tier recipient) | TopBar, IndentProgressCard, LoginForm (cycle shown pre-auth), ReviewSubmitModal | `server read` | e.g. "S&OP-1A · Jul 2026", "15 Jul, 23:59 IST", recipient "R. Khanna, ASM North Cluster" | Shown on the login screen before authentication — confirm this is intended to be public/pre-auth data |
| D16 | Dealer/account profile | TopBar, HomeDashboard greeting, ReviewSubmitModal subtitle | `server read` | dealer name, dealer code, verticals covered, outlet count/region, avatar initials | |
| D17 | Authenticate (dealer code/email + password, or SSO) | LoginForm | `server mutation` | identifier, password | Errors modeled: unrecognised identifier, incorrect password (with attempts-remaining message) |
| D18 | Active filter selections (Vertical, FERT, Sub-vertical, Demand segment, MPG, Tonnage, Fuel, Cabin, FERT History range, Status flags) | FilterRail, IndentGrid, RollupTable, WorkbookToolbar (tokens) | `local UI state` | one `Set<string>` per filter key | Survives navigating between Home ↔ Workbook (module-level JS state), but is not shown to survive a page reload/new session in this prototype |
| D19 | Search query (code/description text) | WorkbookToolbar, IndentGrid | `local UI state` | free text | |
| D20 | Saved filter views | FilterRail | `TBD` | view name (derived from active filters), filter snapshot | Open question Q3 — unclear if this must persist server-side per user/device or is session-only |
| D21 | Sort column + direction | IndentGrid | `local UI state` | column key, `asc`/`desc` | Third click clears sort entirely |
| D22 | Column band visibility mode (off/summary/full per band), density (comfortable/compact), filter-rail collapsed/expanded | ColumnsPopover, WorkbookToolbar, IndentGrid, RollupTable, FilterRail | `local UI state` | per-band mode map, density flag, rail collapsed flag | Open question Q5 — unclear if these should persist per-user across sessions |
| D23 | Selected line + drawer open/closed | LineDetailDrawer | `local UI state` | FERT line id, open boolean | |
| D24 | Modal open/closed state (Add FERT, Export, Review & submit) | AddFertModal, ExportModal, ReviewSubmitModal | `local UI state` | boolean per modal | Escape key closes all three |
| D25 | Export CSV content (derived view of already-loaded indent + reference data) | ExportModal | `client global state` | full 34-column row set per D1/D2/D6–D10 | Not fetched separately — a client-side transform/format of data already loaded for D1/D2/D6–D10; in production this should still go through a typed selector, not ad-hoc string building |
| D26 | Theme preference (light/dark) | TopBar | `local UI state` | `data-theme` attribute, falls back to `prefers-color-scheme` | No evidence of server-side persistence in the HTML |
| D27 | Rollup group-by selection + expanded group rows | RollupTable | `local UI state` | group-by key, `Set` of expanded group keys, per-band mode map (separate from the grid's) | |
| D28 | Persona selection (prototype-only navigation control) | PersonaSwitcher | `TBD` | selected persona value | Not a production data need — see components.md Q6; flagged here only so coverage-checker doesn't report it missing |

### Sensitive fields
None of the fields observed (FERT codes, quantities, stock, dealer name/code, offtake/retail
figures) fall under AGENTS.md §8's sensitive-data list (SSN/Aadhaar/PAN/passport/licence/patient
records). No masking required for this screen.

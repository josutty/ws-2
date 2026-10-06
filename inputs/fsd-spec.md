**VECV S&OP Transformation**

**Demand Planning Workbench**

Functional Specification Design Document — Phase 0

*Track 1 · For Business Stakeholder Review & Sign-off*

| **Document Purpose:** This document defines the Phase 0 solution for the Demand Planning Workbench (T1). It is intended for business stakeholder review and sign-off, and will subsequently be handed to the UST technical team to produce the Technical Specification. |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

### Document Version Control

<table>
<colgroup>
<col style="width: 9%" />
<col style="width: 23%" />
<col style="width: 23%" />
<col style="width: 12%" />
<col style="width: 18%" />
<col style="width: 11%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Version</strong></th>
<th><strong>Description</strong></th>
<th><strong>Author / Role</strong></th>
<th><strong>Date</strong></th>
<th><strong>Reviewer</strong></th>
<th><strong>Sign-off Date</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>v1.0</td>
<td>Initial draft — Phase 0 Functional Specification design for Demand Planning Workbench</td>
<td><p>Hemant</p>
<p>SCM Domain Expert / Solutions Lead</p></td>
<td>18 Jun 2026</td>
<td>—</td>
<td>—</td>
</tr>
<tr class="even">
<td>v1.0</td>
<td>Reviewer — Business / Demand Planning</td>
<td><p>Sanjay Malviya/Raj Kumar</p>
<p>VECV Demand Planner</p></td>
<td>—</td>
<td>Pending</td>
<td>—</td>
</tr>
<tr class="odd">
<td>v1.0</td>
<td>Reviewer — Kinaxis / Functional</td>
<td><p>Ankit</p>
<p>Kinaxis Expert</p></td>
<td>—</td>
<td>Pending</td>
<td>—</td>
</tr>
<tr class="even">
<td>v1.0</td>
<td>Reviewer — IT</td>
<td><p>Zakaria</p>
<p>IT Reviewer</p></td>
<td>—</td>
<td>Pending</td>
<td>—</td>
</tr>
<tr class="odd">
<td>v1.0</td>
<td>Sign-off — Business</td>
<td><p>Ekansh / Vikas</p>
<p>VECV S&amp;OP Lead</p></td>
<td>—</td>
<td>Pending</td>
<td>—</td>
</tr>
<tr class="even">
<td>v1.0</td>
<td>Sign-off — IT</td>
<td><p>Manish Gupta</p>
<p>VECV IT Lead</p></td>
<td>—</td>
<td>Pending</td>
<td>—</td>
</tr>
<tr class="odd">
<td>v1.1</td>
<td>Updated to reflect current UX prototype (v23): COCO personas, S&amp;OP-1B revision cycle, MTO screen status; business review comments (Jun 2026) addressed inline; user stories consolidated into external tracker.</td>
<td>Hemanth Holla | SCM Domain Expert / Solutions Lead</td>
<td>28 Jul 2026</td>
<td>—</td>
<td>—</td>
</tr>
<tr class="even">
<td>v1.2</td>
<td>Corrected S&amp;OP-1B narrative (parity with the existing Kinaxis capability, not a new process); reframed Business Challenges around the confirmed Kinaxis sunset decision and the missing-analytics gap;</td>
<td>Hemanth Holla | SCM Domain Expert / Solutions Lead</td>
<td>28 Jul 2026</td>
<td>—</td>
<td>—</td>
</tr>
<tr class="odd">
<td>v1.3</td>
<td>IB, IS and NPI documented as fully built standalone workbenches</td>
<td>Hemanth Holla | SCM Domain Expert / Solutions Lead</td>
<td>05 Aug 2026</td>
<td>—</td>
<td>—</td>
</tr>
<tr class="even">
<td>v1.4</td>
<td>Added Section 9, Business Logic Summary —NPI variant logic, No new scope introduced;</td>
<td>Hemanth Holla | SCM Domain Expert / Solutions Lead</td>
<td>06 Aug 2026</td>
<td>—</td>
<td>—</td>
</tr>
</tbody>
</table>

*Note: This document requires sign-off from both business stakeholders and IT lead before the UST technical specification build begins.*

## Contents

## 1. Overall Objective

### Business Challenges

VECV leadership has taken the decision to sunset Kinaxis Rapid Response and move the S&OP indent cycle onto VECV plan, an in-house web-based platform that VECV will own and extend directly — rather than remain dependent on a third-party licensed tool that was never built around VECV's specific dealer network structure, its COCO outlets, or the tiered Dealer to CSM/ASM to RSM to VH to ISO moderation chain.

Moving off Kinaxis is not a like-for-like swap. Several capabilities that already work today need to be deliberately carried forward without a gap, and some longstanding process gaps need to be closed at the same time:

- COCO and regular dealer indents run through disconnected processes today, with no unified workbench for RSM and VH to moderate both channels together before they converge into a single vertical demand plan.

- The S&OP-1B revision cycle, where RSM, VH and ISO revise their numbers against a locked S&OP-1A baseline, runs inside Kinaxis today. As part of the Kinaxis sunset, VECV plan needs to reproduce this capability on the new platform from day one, with no loss of functionality during the transition.

- Plan-performance and indent-accuracy analytics that planners rely on day to day — M1-vs-ABP tracking, indent accuracy scoring, stock aging and mix visibility, rollup views by vertical — are largely manual today. These are being built directly into the Phase 0 Summary Dashboard rather than deferred to Phase 1.

VECVplan is designed to close these gaps as a Phase 0 MVP while staying build-once-extend-always: the same screens and data model are architected so that the other tracks in VECV's wider S&OP transformation — Rush Order Management, the Planning Intelligence Engine, Pipeline Intelligence, FERT Management & MDM, Supply Plan & EDD, and the Control Tower — can plug in as they come online without requiring this workbench to be rebuilt. Phase 0 deliberately keeps its own scope tight — system-recommended indent, automated alerting, and extended SAP/data integration are sequenced into Phase 1 — so the platform can go live quickly and be extended later without a rebuild.

VECVplan is VECV's in-house, web-based S&OP planning platform — purpose-built to replace Kinaxis RapidResponse as the primary demand planning tool. The Demand Planning Workbench (Track 1) is the centerpiece of Phase 0: the thirteen-persona digital workbook (five on the regular dealer network, three on the COCO channel, three on International Business, one on Institutional Sales, one on NPI) through which demand is collected from dealers, enriched and moderated tier by tier, and consolidated into a net production plan for PPC.

The governing design principle of the programme, set by leadership, is build-once-extend-always. Every component designed and built in Phase 0 is a permanent part of the final platform. Phase 1 extends the same screens, the same database, and the same codebase — it does not rebuild them. A business user who learns the Phase 0 interface is already familiar with Phase 1.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Phase 0 goal:</strong> A working Demand Planning Workbench live in production — covering the full dealer indent and consolidation workflow — built on the permanent platform stack.</p>
<p><strong>Phase 1 goal:</strong> The same workbench extended with planning intelligence — system-recommended indent, alert engine, and CP Intelligence Engine output feeding into every planner screen.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 2. Scope: Phase 0 vs Phase 1

The table below defines the boundary between what is built in Phase 0 and what Phase 1 adds on top. This boundary is the most important single page of this document — it defines what UST builds first, and what the business should not expect until Phase 1. The table below captured the key columns. You can refer to the UX for the more extensive set of columns.

<table>
<colgroup>
<col style="width: 21%" />
<col style="width: 37%" />
<col style="width: 41%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Component</strong></th>
<th><strong>Phase 0 — Delivers</strong></th>
<th><strong>Phase 1 — Adds (on same screens)</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Dealer screen</td>
<td>FERT-level indent entry (M1 weekly, M2/M3 monthly). Reference columns: 3M avg, 6M avg. Prior cycle indent. Auto-submit at cut-off (15th).</td>
<td>System Recommended Indent column. Safety stock norm. Over/under planning alert. Pipeline + retail trend columns.</td>
</tr>
<tr class="even">
<td>CSM/ASM screen</td>
<td>Cluster-level review. Dealer layer (read-only). CSM/ASM enrichment layer (editable). Cluster aggregate auto-calculated. Override reason. Auto-submit at cut-off (16th).</td>
<td></td>
</tr>
<tr class="odd">
<td>RSM screen</td>
<td>Region-level review. Dealer + CSM/ASM layers (read-only). RSM layer (editable, top-down or FERT level). Region aggregate auto-calculated. Auto-submit at cut-off (17th).</td>
<td>Alert rules (volume &lt; ABP, indent &gt; 20% ABP, RSM &lt;= dealer or CSM/ASM). Pipeline reference column. TIV and market share columns.</td>
</tr>
<tr class="even">
<td>VH screen</td>
<td>Vertical-level moderation. All lower layers (read-only). VH layer (editable). Override with reason. Auto-submit at cut-off (18th).</td>
<td>Revenue and GM by FERT. Days-of-coverage stock review. Alert rules. Market share and profitability reports.</td>
</tr>
<tr class="odd">
<td>ISO screen</td>
<td>Sales Plan (read-only, auto-populated from VH’s submitted indent) + a separate, ISO-editable Production Requirement. ISO does not reference Dealer/CSM/ASM/RSM layers — only VH’s final number. Production Requirement carries 1st Priority and RGP fields comes from VH as well. Auto-submit at cut-offs (19th–20th) once all VH layers are submitted.</td>
<td>Automated safety stock norm. Submission gate checklist. Backlog management. Portal-to-PPC API replacing CSV. Full audit log.</td>
</tr>
<tr class="even">
<td>Approval chain</td>
<td><p>Auto-submit at cut-offs (15th/16th/17th/18th). Email notification at each cut-off trigger. Locking: each tier locks on cut-off, view-only thereafter.</p>
<p>Email alert 2-3 days before cut-off. Alert to CSM/ASM/RSM if no dealer submission by 15th. Escalation rules. More elaborate business rules will be added.</p></td>
<td></td>
</tr>
<tr class="odd">
<td>Data / netting</td>
<td>3M/6M actuals + ABP + FG inventory from SAP daily SFTP extract. Simple netting formula (VH + manual SS - FG). CSV output to PPC. WIP/RGP netting remains a PPC-owned step outside this workbench in both Phase 0 and Phase 1 (confirmed by business, Jun 2026) — not a gap to close. FERT master, billing actuals, FG inventory and dealer master are sourced via SAP BW / the enterprise data lake (see Section 6.2); ABP sourcing is an open item (Section 8.2).</td>
<td></td>
</tr>
<tr class="even">
<td>COCO screens</td>
<td>COCO CSM/ASM, COCO RBH and COCO VH indent screens, mirroring Dealer → CSM/ASM → RSM. Dedicated COCO Dashboard for RSM and VH shows COCO-only data by vertical and city. COCO VH submission is designed to consolidate with the regular dealer-network VH view.</td>
<td></td>
</tr>
<tr class="odd">
<td>IB (International Business) screen</td>
<td>Standalone workbench (not an MTO sub-tab). Country Head → Regional Head → Global Head cascade on a single shared worksheet. M1 locked to firm orders; M2–M6 forward visibility, editable by all three roles. Sidebar filters: Region, Country, FERT, Vertical, MPG, Tonnage, Fuel, AC, Demand Segment (scoped per-country).</td>
<td></td>
</tr>
<tr class="even">
<td>IS (Institutional Sales) screen</td>
<td>Standalone workbench, single ISO-owner login (no cascade — confirmed by the source sheet's own title). Demand Workbook (Net Qty = Demand − Opening Stock − Committed) plus a read-only Orders Tracker.</td>
<td></td>
</tr>
<tr class="odd">
<td>NPI (New Product Introduction) screen</td>
<td>New persona, not previously scoped in this document. Single NPI-owner login. Handles the three FERT/EBOM/MBOM scenarios from the business feedback document, with a non-mandatory reference-FERT-code fallback for MBOM-not-yet-available lines. Submit-freeze rule: quantities lock after submission, only the reference/FERT code stays correctable.</td>
<td></td>
</tr>
<tr class="even">
<td><p><strong>What is NOT in Phase 0</strong></p>
<p><strong>(explicit exclusions)</strong></p></td>
<td>Statistical forecast. System Recommended Indent. AI/ML. Pipeline analytics. FERT validation. Alert engine. EDD calculation. Safety stock norm formula. Backlog management.</td>
<td>All of the above are Phase 1 additions layered onto Phase 0 screens.</td>
</tr>
</tbody>
</table>

<img src="media/image1.png" style="width:6.69444in;height:1.18958in" />

## 3. Personas

Phase 0 of the Demand Planning Workbench serves thirteen personas across four parallel workflows that converge at Vertical Head or ISO: the regular dealer network (Dealer → CSM/ASM → RSM → VH), the COCO channel (COCO CSM/ASM → COCO RBH → COCO VH), International Business (IB Country Head → IB Regional Head → IB Global Head), and two single-owner logins — IS (Institutional Sales) and NPI (New Product Introduction). Each has a distinct role in the monthly S&OP indent cycle. The system enforces data-level security — each persona can only see and edit the data appropriate to their role.

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 21%" />
<col style="width: 29%" />
<col style="width: 32%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Persona</strong></th>
<th><strong>Who They Are</strong></th>
<th><strong>Role in the Indent Cycle</strong></th>
<th><strong>Data Visibility &amp; Security</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>Dealer</p>
<p>(Regular)</p></td>
<td>Authorised vehicle dealers and Company Owned Company Operated (COCO) outlets across LMD, HD, and Bus verticals.</td>
<td>Demand originator. Enters FERT-level indent for M1 (weekly) and M2/M3 (monthly). First node in the bottom-up demand collection chain.</td>
<td>Can only see and edit their own dealership's data. No visibility into other dealers, CSM/ASM layer, or any layer above. Security enforced at database level, not just UI.</td>
</tr>
<tr class="even">
<td><p>CSM/ASM</p>
<p>(Country Sales Manager)</p></td>
<td>Country-level sales managers who own a cluster of dealers within a vertical and region.</td>
<td>Cluster enrichment. Reviews all dealer indents within their cluster (read-only). Adds a CSM/ASM enrichment layer reflecting market knowledge beyond individual dealer inputs.</td>
<td>Sees all dealers within their cluster only. Cannot edit dealer numbers — dealer layer is locked and read-only. Edits only the CSM/ASM layer.</td>
</tr>
<tr class="odd">
<td><p>RSM</p>
<p>(Regional Sales Manager)</p></td>
<td>Regional sales managers who oversee multiple CSM/ASM clusters across a region and vertical.</td>
<td>Regional moderation. Reviews CSM/ASM and dealer layers at region level. Can take a top-down approach (set a regional total) or work at FERT level. Validates critical demand for W1.</td>
<td>Sees all CSM/ASMs and dealers within their region only. Cannot edit CSM/ASM or dealer numbers. Edits only the RSM layer.</td>
</tr>
<tr class="even">
<td><p>Vertical Head</p>
<p>(VH)</p></td>
<td>Senior leaders responsible for an entire vertical (LMD, HD, or Bus) across all regions.</td>
<td>Vertical moderation. Final sales-side gate. Reviews all regional and cluster layers for their vertical and provides the VH-level final demand view. This is the number ISO uses as its starting point.</td>
<td>Sees their entire vertical only. Cannot see other verticals. Cannot edit RSM/CSM/ASM/dealer numbers. Edits only the VH layer.</td>
</tr>
<tr class="odd">
<td>ISO / Central Planning Moderator</td>
<td>VECV's Central Planning team — the internal demand planning function that consolidates all vertical inputs and produces the net plan.</td>
<td>National consolidation. Sees all verticals, all layers. Overrides where needed (with mandatory reason code). Performs demand netting. Releases the net production plan to PPC.</td>
<td>Full visibility across all verticals, all layers (read-only except their own override column). Override reason code is mandatory — system does not allow release without it.</td>
</tr>
<tr class="even">
<td>IB Country Head</td>
<td>Business lead for International Business demand within a single country (e.g. Bangladesh).</td>
<td>First tier of IB moderation. Enters/moderates the shared IB worksheet for their own country — M1 locked to firm orders, M2–M6 forward months editable.</td>
<td>Sees and edits only their own country's rows.</td>
</tr>
<tr class="odd">
<td>IB Regional Head</td>
<td>Business lead for a cluster of IB countries (e.g. South Asia).</td>
<td>Regional IB moderation across the country cluster, on the same shared worksheet.</td>
<td>Sees all countries within their region; edits within regional scope.</td>
</tr>
<tr class="even">
<td>IB Global Head</td>
<td>Business lead for International Business across all countries.</td>
<td>Global IB consolidation and moderation — top of the IB cascade, mirroring VH's role on the regular network.</td>
<td>Sees and edits across all IB countries and regions.</td>
</tr>
<tr class="odd">
<td>IS (Institutional Sales)</td>
<td>VECV's Institutional Sales / ISO team.</td>
<td>Single-owner demand submission and order tracking for institutional (government/fleet) customers — no cascade, confirmed by the source Kinaxis sheet's own title.</td>
<td>Full visibility and edit rights within the IS Demand Workbook and Orders Tracker; no visibility into the regular dealer network.</td>
</tr>
<tr class="even">
<td>NPI (New Product Introduction)</td>
<td>VECV's NPI / PMO team.</td>
<td>Single-owner upload of the NPI vehicle plan each S&amp;OP cycle — week-wise for the current month, monthly for forward months — with a reference-FERT-code fallback for lines awaiting a released MBOM.</td>
<td>Full visibility and edit rights within the NPI workbench; no cascade or visibility into other personas' data.</td>
</tr>
<tr class="odd">
<td>COCO CSM/ASM</td>
<td>COCO cluster sales managers who own a group of company-owned, company-operated outlets within a vertical.</td>
<td>Demand originator for the COCO channel. Enters FERT-level indent for M1 (weekly) and M2/M3 (monthly) for their COCO outlets — mirrors the Dealer role but for company-owned outlets.</td>
<td>Can only see and edit their own COCO cluster's data. No visibility into the regular dealer network or other COCO clusters.</td>
</tr>
<tr class="even">
<td>COCO RBH (Regional Business Head)</td>
<td>Regional heads overseeing multiple COCO CSM/ASM clusters within a region.</td>
<td>Regional consolidation for the COCO channel. Reviews COCO CSM/ASM indents (read-only) and adds a COCO RBH enrichment layer — mirrors the CSM/ASM → RSM step on the regular network.</td>
<td>Sees all COCO CSM/ASMs within their region only. Cannot edit COCO CSM/ASM numbers — that layer is locked and read-only.</td>
</tr>
<tr class="odd">
<td>COCO VH</td>
<td>Vertical-level leaders for the COCO channel.</td>
<td>Vertical moderation for COCO. Reviews COCO CSM/ASM and COCO RBH layers (read-only) and enters the COCO VH final view. This is the number that is designed to merge with the regular dealer-network VH view for consolidation into a single vertical demand plan (see Section 8.3 — this consolidation is not yet fully rendered in the UX).</td>
<td>Sees their COCO vertical only. Cannot edit COCO RBH/CSM/ASM numbers.</td>
</tr>
</tbody>
</table>

## 4. Requirements: User Stories by Persona

The full, current set of user stories for the Demand Planning Workbench — including Phase 0/Phase 1 tagging, and live status — is maintained in the User Story Tracker.

Refer to the spreadsheet in location: Next Steps \> User Stories \> User Stories Modified.

*Note: earlier drafts of this document carried full story tables inline. As of this revision those are consolidated into the User Story Tracker to avoid two sources of truth drifting apart; only the Tracker should be updated going forward.*

<img src="media/image2.png" style="width:6.69444in;height:2.04514in" />

## 5. Indent Workflow — End to End

The following table defines the monthly indent cycle from dealer submission through to ISO release of the net production plan. This is the process backbone the Phase 0 solution is built on.

<table>
<colgroup>
<col style="width: 6%" />
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 21%" />
<col style="width: 12%" />
<col style="width: 26%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Step</strong></th>
<th><strong>Persona</strong></th>
<th><strong>Trigger</strong></th>
<th><strong>What They Do</strong></th>
<th><strong>Cut-off</strong></th>
<th><strong>Output to Next Step</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>1</td>
<td>Dealer</td>
<td><p>Cycle opens 1st of month.</p>
<p>Alert 2-3 days before cut-off (Phase 1).</p></td>
<td>Enters indent at FERT level for M1 (weekly) and M2/M3. Reviews 3M/6M avg, ABP, prior cycle. Submits manually or allows auto-submit.</td>
<td><p>15th midnight</p>
<p>Auto-submit 16th 00:00:01</p></td>
<td>Dealer indent quantities locked and visible to CSM/ASM.</td>
</tr>
<tr class="even">
<td>2</td>
<td>CSM/ASM/ASM</td>
<td>Notified when dealer cut-off fires.</td>
<td>Reviews all dealer indents in cluster (read-only). Adds CSM/ASM enrichment layer. Records override reason if deviating from dealer aggregate.</td>
<td><p>16th midnight</p>
<p>Auto-submit to RSM</p></td>
<td>CSM/ASM/ASM layer + dealer layer passed to RSM.</td>
</tr>
<tr class="odd">
<td>3</td>
<td>RSM</td>
<td>Notified when CSM/ASM cut-off fires.</td>
<td>Reviews CSM/ASM and dealer layers at region level. Enters RSM layer (top-down or FERT-level). Validates W1 critical/high-priority demand. Records override reason.</td>
<td><p>17th midnight</p>
<p>Auto-submit to VH</p></td>
<td>RSM layer + lower layers passed to VH.</td>
</tr>
<tr class="even">
<td>4</td>
<td>Vertical Head</td>
<td>Notified when RSM cut-off fires.</td>
<td>Reviews all three lower layers for their vertical. Enters VH final view. Records override reason if deviating significantly from RSM.</td>
<td><p>18th midnight</p>
<p>Auto-submit to ISO</p></td>
<td>VH indent passed to ISO as the demand input.</td>
</tr>
<tr class="odd">
<td>5</td>
<td>ISO / Central Planning</td>
<td>Notified when all VH layers are submitted.</td>
<td>Sees all four layers consolidated. Overrides where needed (mandatory reason code). Enters manual SS qty. System calculates net production requirement. Reviews submission status — all VH must be in before release.</td>
<td><p>19th–20th</p>
<p>(all VH must have submitted)</p></td>
<td>Net production plan (week-wise, by FERT) exported as CSV to PPC.</td>
</tr>
<tr class="even">
<td>6</td>
<td>PPC</td>
<td>Receives CSV net plan from ISO.</td>
<td>Reviews net production requirement. Incorporates into production scheduling process.</td>
<td>—</td>
<td>Production plan (outside scope of Phase 0 workbench).</td>
</tr>
</tbody>
</table>

*Note: If a tier does not submit by their cut-off, the system auto-submits whatever has been entered. If nothing has been entered, the prior cycle value is used as the default. This rule must be confirmed with business before build starts (see Section 8 — Open Items).*

### S&OP-1B Revision Cycle

After the S&OP-1A cycle locks at ISO, a second revision cycle — S&OP-1B — opens for RSM, VH and ISO only. Dealer and CSM/ASM submissions remain locked from 1A and are shown read-only for reference; they do not get a revision window. In the RSM, VH and ISO screens, 1B adds an S&OP-1 (Locked) reference column alongside an S&OP-2 (Comparison) column, so the moderator can see the locked baseline and the revised number side by side. This mirrors the S&OP-1B capability that runs inside Kinaxis today; as VECVplan replaces Kinaxis, this section confirms VECVplan is designed to carry that capability forward without a gap, consistent with the confirmed decision that only RSM, VH and ISO carry revision/edit capability post-15th — Dealer and CSM/ASM indent only for S&OP-1A.

## 6. Solution Design — Phase 0

This section describes the solution design for Phase 0 of the Demand Planning Workbench. It covers screen design, data and fields, approval chain logic, and demand netting. Detailed supporting materials are referenced as attachments.

### 6.1 Screen Design

The Demand Planning Workbench is built as a web application in the style of a planning workbook — dense, structured grids with frozen left columns (FERT code, description, segment), reference data columns to the left, editable input columns in the centre, and calculated summary columns to the right. This design is intentionally close to the Kinaxis workbook style, to minimise the learning curve for planners who have used Kinaxis.

The application is built on the permanent stack & same stack is used for Phase 1 and beyond — no rebuild.

The same screens and data model are also designed to remain compatible with the other tracks in VECV's wider S&OP transformation as they come online — Rush Order Management, the Planning Intelligence Engine, Pipeline Intelligence, FERT Management & MDM, Supply Plan & EDD, and the Control Tower — so those capabilities extend this workbench rather than requiring a parallel or replacement system.

A persistent top navigation bar shows the current S&OP cycle stage (e.g., Dealer submitted, CSM/ASM pending), cut-off countdown for the active stage, and a Phase 0 / Phase 1 indicator. Phase 0 / Phase 1 indicators are dummy and will be removed during development.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Attachment A — UX Prototype:</strong> <em>Detailed screen designs for all thirteen persona screens across five linked files, with Phase 0 / Phase 1 toggle. See attached files: VECVplan-Demand-Planning-Workbench-Phase0.html (main — Dealer/CSM/ASM/RSM/VH/ISO), VECVplan-COCO-Workbench-Phase0.html, VECVplan-IB-Workbench-Phase0.html, VECVplan-IS-Workbench-Phase0.html, VECVplan-NPI-Workbench-Phase0.html</em></p>
<p><em>The detailed prototypes are present in sharepoint,</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

### 6.2 Data, Fields & Source Systems

> **Note:** "This section (Data, Fields & Source Systems) reflects analysis already completed by UST — source systems, field-level mapping, and refresh frequency have been identified for each data entity. No further input needed from the business side here; treating this section as closed."

### 6.3 Approval Chain & Cut-off Logic

The approval chain is the core workflow of Phase 0. It enforces the monthly S&OP cycle discipline through automatic locking, auto-submission, and email notification.

| **Rule**                           | **Detail**                                                                                                                                                                                    |
|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Cut-off dates                      | Dealer: 15th midnight. CSM/ASM: 16th midnight. RSM: 17th midnight. VH: 18th midnight. If cut-off date is a public holiday, cut-off moves to the prior working day.                            |
| Auto-submit                        | At cut-off time, the system automatically submits whatever has been entered by that tier. Manual submission before cut-off is also available.                                                 |
| Locking                            | Each tier's data locks at their cut-off. Once locked, the data is read-only for that tier. Dealer cannot edit after 15th; CSM/ASM cannot edit after 16th; and so on.                          |
| Email notification                 | An email is sent to the relevant next-tier personas when a tier's cut-off fires (or the tier manually submits). ISO is notified when all VH layers are submitted.                             |
| Default on auto-submit if no entry | If a tier has not entered any data and cut-off fires, the prior cycle's value for that tier is used as the submitted value. This must be confirmed with business — see Open Items.            |
| Release gate                       | ISO cannot release the net plan to PPC until all VH layers show as submitted. The release button is disabled until all verticals are in.                                                      |
| Override reason                    | RSM, VH, and ISO must enter a reason code or reason text when their layer deviates from the tier below. This is enforced in Phase 0 and carries forward as an immutable audit log in Phase 1. |

### 6.4 Demand Netting (ISO Screen)

This section describes netting purely from VH's own submitted indent (the regular dealer network). In practice, the demand feeding into this step needs to be consolidated across all parallel channels — the regular network (via VH), COCO (via COCO VH), NPI, IB (via IB Global Head), and Institutional Sales — into one net production requirement before it's handed to PPC. ~~That consolidation logic and screen(s) don't exist yet in the current design or UX. **Flagging this now as a business requirement so it's scoped ahead of development — the actual screen design will follow once development starts.**~~ High-level objective: take the intents coming in from all channels and process them into a single production requirement before handoff to production. The details are present in the SharePoint UX.. Some of the key features are highlighted below:

- the ISO Consolidation Workbench has four screens — Vehicle Moderation (Private / IB / IS / NPI sub-tabs), Production Plan by FERT (All Channels / EPS sub-tabs), Production Plan Summary, and Summary & KPIs.

- ISO's Private-channel input remains VH's final submitted number, shown read-only (Section 9.4) — COCO does not net separately at ISO: VH sees COCO as a read-only reference and combines it judgementally into the one submitted Private figure.

- S&OP-1A and S&OP-1B are structurally different screens, not the same layout with different data — they carry different column sets. Both the Channel Moderation (Private) and Production Plan by FERT screens render cycle-aware.

- Model Year (MY) split originates at VH, not at ISO. VH enters and toggles the MY2026/MY2027 split on its own indent workbook; ISO displays VH's submitted split read-only, so there is a single source of truth rather than two independently editable copies.

- A 30% maximum-deviation rule applies to RSM and VH: their S&OP-1B indent may not diverge more than 30% from the locked S&OP-1A figure without a flag (Match NOS / Match % columns, shown red on breach). This gates what reaches ISO in the revision cycle.

- The Summary & KPIs screen covers: M1 Plan vs ABP, vs 6-Month Average, Plan Variance (1A vs 1B), Aged Stock \>180 days, Channel Mix, Week-1 Concentration %, and a 4-band stock-aging table (\<60D / 60–90D / 90–180D / \>180D). The final KPIs could be refined further within the existing data.

- Unresolved / still open, flagged plainly rather than assumed: RGP and Priority-quantity ownership (Open Item OI-07 — a 3 Aug 2026 transcript shows RGP entered directly inside ISO's own screen, which conflicts with the “PPC owns RGP netting” position confirmed in June 2026; see also Section 9.5); which two verticals net together at VH; and OI-08, the exact S&OP-1B moderation logic at ISO. None of these are resolved as of this revision.

### 6.4 EPS (Engine Power Solutions)

> **Note:** the source document numbers this section "6.4" as well, duplicating the
> Demand Netting heading above — likely a numbering slip in the original doc rather
> than intentional. Flagging rather than silently renumbering.

> There is requirement for another persona: EPS. This will be a standalone page, structured similarly to Institutional Sales (IS) or NPI — single-owner, no cascade. ~~The UX for this screen has not been designed yet; it will be a simple page, and detailed requirements will be provided before development starts. Flagging it now, ahead of time, so it's captured in scope. Note: this connects to the existing 'EPS tab' placeholder already noted in this document as pending structure from business — this entry formalizes it as its own standalone screen rather than a tab within another persona's view.~~ EPS - Engine & Powertrain Sales — engines and axles, not vehicles. It has been built as its own standalone workbench (Attachment: VECVplan-EPS-Workbench-Phase0.html), single-owner with no cascade as originally scoped, and it also has its own Production Plan tab within the ISO Consolidation Workbench's Production Plan by FERT screen — kept separate from the vehicle "All Channels" tab, not merged in as a 5th Sales Area. Still open: the EPS Summary-split question and confirmation of the EPS Axles & Aggregates band.

### 6.5 Additional Details

> Most of the below details are present in the UX screens. They have been re-iterated here.

| **Area / Screen**                          | **Open Item**                                                                                                                                                                                                                               |
|--------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Dealer                                     | If a Dealer submits nothing by its cut-off, the prior cycle's value is used as the default;                                                                                                                                                 |
| VH screen                                  | RGP plan process and Model Year process need to be reflected in the VH screen design.                                                                                                                                                       |
| Dealer screen                              | Dealer opening FG inventory and “as on date” inventory details need to be captured; not currently a field.                                                                                                                                  |
| VH                                         | VH need a separate view/summary of COCO indents alongside the regular dealer-network view.                                                                                                                                                  |
| All indenting screens                      | Filters must be configurable per vertical rather than fixed — HD uses tonnage (18/19/22/24T), LMD uses MPG series (6000 series), Bus uses body type (cowl/bus), 4x2 uses wheelbase (2022/2024). Left filter panel to be made comprehensive. |
| Flexible Approval workflow                 | ASM will be added to the active workflow instead of CSM; system will be built with a configurable workflow engine so an approval layer can be inserted later without code changes.                                                          |
|                                            |                                                                                                                                                                                                                                             |
| Workflow in case of vacant positions       | Where an position is vacant, the workflow will wait for sometime before moving to the next position in the hierarchy                                                                                                                        |
|                                            |                                                                                                                                                                                                                                             |
| Persona transfer / exit                    | Need a process on how to handle the persona exits/transfers — via change request or automatically.                                                                                                                                          |
| All indenting screens                      | Filter, sort, and hide/unhide column options are requested across indenting screens.                                                                                                                                                        |
| Indent templates                           | Zero-quantity line items should not be visible in any indent template.                                                                                                                                                                      |
| IS — Demand Netting & Moderation           | The two forward-month projection columns need to be editable to allow manual upload of the forecast plan.                                                                                                                                   |
| IS — Demand Indent workbook                | Order column total should sum all orders; inserting a new record in the projection column does not work — updates only possible against existing orders.                                                                                    |
| IS — Plan override                         | Week-wise (4-week) IS plan override requested, matching the capability already available for the Private market, to monitor critical orders across IS MTOs.                                                                                 |
| Sales Demand Indent — Auto-submit (S&OP-2) | Auto-submit for RSM and VH indent requested for S&OP-2, matching existing S&OP-1 capability. \\                                                                                                                                             |
| Sales Demand Indent — Auto-copy            | Indent should auto-copy up the chain with auto-submit: Dealer→CSM, CSM→RSM, RSM→VH.                                                                                                                                                         |
| Dealer Indent — FERT code                  | Manual upload of FERT code requested, displayed in the indent workbook across verticals; other codes remain selectable via the existing Add/New FERT Code feature.                                                                          |
| IS Order Tracker — EDD                     | EDD column in the IS Order List should reflect correct details against IS order numbers.                                                                                                                                                    |

## 7. What Phase 1 Adds

*A Phase 1 Solution Design Document will be produced separately, extending this document, once Phase 0 is in production and learnings from the first live cycles are available.*

## 8. Open Items

This section is a running log of unresolved questions, pending business decisions, and known defects raised across design reviews and stakeholder walkthroughs, consolidated here so they are tracked in one place ahead of the UST technical build. Items are tagged OI-01 through OI-22 for cross-reference elsewhere in this document; status reflects the position as of this revision.

## 9. Business Logic Summary (Quick Reference)

This section is a standalone 1–2 page summary of the core business rules the workbench enforces, independent of screen design — intended as a quick reference for anyone who needs the logic without reading the full design. It restates rules already detailed in Sections 2–6; it does not introduce new scope.

### 9.1 Who Plans, In What Order

Demand flows bottom-up through four parallel chains, all converging at Vertical Head (VH) and then into ISO for national consolidation: the regular dealer network (Dealer → CSM/ASM → RSM → VH), COCO (COCO CSM/ASM → COCO RBH → COCO VH), International Business (IB Country Head → IB Regional Head → IB Global Head), and two single-owner chains with no cascade — Institutional Sales (IS) and NPI. Each tier can only see and edit its own layer; everything below is read-only reference and everything above does not exist from that tier’s point of view (see Section 3, Data Visibility & Security).

### 9.2 The Monthly Cycle & Locking

Each tier has a cut-off (Dealer 15th, CSM/ASM 16th, RSM 17th, VH 18th, ISO 19th–20th; Section 6.3). At cut-off, whatever has been entered auto-submits and locks — the tier below can no longer edit it, and the tier above sees it as its starting reference. If a tier enters nothing, the prior cycle’s value is used as the default; this default rule is still pending business confirmation (Open Item OI-01). A second revision window, S&OP-1B, then opens for RSM, VH and ISO only, against the locked S&OP-1A baseline — Dealer and CSM/ASM do not get a second pass (Section 5, S&OP-1B Revision Cycle).

### 9.3 Overrides Carry a Reason

Whenever RSM, VH or ISO changes a number handed up from the tier below, it must attach a reason code or free-text justification. This becomes a permanent, immutable audit log carried forward into Phase 1 (Section 6.3, Override Reason).

### 9.4 ISO’s Consolidation Logic

ISO does not reference the Dealer, CSM/ASM or RSM layers at all — its key input is VH’s final submitted number, shown as a read-only Sales Plan block (current month weekly, plus two months forward). ~~In practice, the demand feeding into this step needs to be consolidated across all parallel channels — the regular network (via VH), COCO (via COCO VH), NPI, IB (via IB Global Head), and Institutional Sales — into one net production requirement before it's handed to PPC.~~ See Section 6.4 for the full Channel Moderation design across all channels, now built as the standalone ISO Consolidation Workbench, including the S&OP-1A/1B, Model Year and 30%-deviation rules that feed into it.

### 9.5 Net Production Formula (Phase 0)

**Net Production Requirement =** VH Indent (or ISO override) + Manually entered Safety Stock − FG Inventory on Hand.

WIP and RGP netting remain a PPC-owned step outside the workbench for Phase 0 — this is a scope boundary, not a gap. Note: a live contradiction has been flagged against this position — the Aug-3 2026 transcript shows RGP being entered directly inside ISO’s own screen, which conflicts with the “PPC owns it” position confirmed in June 2026. This is unresolved; see Open Item OI-07 and the note after Section 6.4.

### 9.6 NPI’s Variant Logic

NPI demand is entered against one of three scenarios per FERT: EBOM and MBOM both available (standard case); FERT code only; or FERT and EBOM available but MBOM not yet released. In the third case, a non-mandatory reference-FERT-code is entered as a stand-in and the line is alert-flagged. Once a cycle is submitted, quantities freeze — only the reference code stays editable, and only on rows that used the fallback (Section 3, NPI persona; Attachment A, VECVplan-NPI-Workbench-Phase0.html).

## 10. Attachments

| **Attachment** | **Description**                                                                                                    | **File Name**                                                                                     |
|----------------|--------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| Attachment A   | UX Prototype — interactive Phase 0 portal mockup showing all thirteen persona screens with Phase 0/Phase 1 toggle. | VECVplan-Demand-Planning-Workbench-Phase0.html + 4 linked files (COCO, IB, IS, NPI) — see Table 6 |
|                |                                                                                                                    |                                                                                                   |
| Attachment C   | User Story Tracker — the current source of truth for all Phase 0/Phase 1 user stories across all personas          | \[external spreadsheet — link provided in the section,                                            |

*Note: Attachments A and B are to be embedded by Hemanth before the document is circulated for review and sign-off; Attachment C (User Story Tracker) is referenced externally rather than embedded, so it stays in sync with the live tracker. None are included in this version.*

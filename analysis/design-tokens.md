# Design Tokens (raw) — Demand Planning Workbench (Phase 0)

Screen analyzed: **dealer** (`inputs/ux/dealer.html`). All values below are copied verbatim from
the HTML's `<style>` block (`:root` custom properties, component classes, and media queries).
Raw only — semantic naming/mapping is styling-engineer's job (AGENTS.md §4, §11).

## Colors — light (default, `:root`)

| Token (as named in HTML) | Value | Used for |
|---|---|---|
| `--canvas` | `#F4F6F8` | page background |
| `--surface` | `#FFFFFF` | card/panel/input background |
| `--surface-2` | `#F8FAFB` | secondary surface (table header bg, disabled input bg, hover idc) |
| `--bar` | `#10202D` | top bar / toast background |
| `--bar-ink` | `#C7D6E2` | top bar text |
| `--ink` | `#16222C` | primary text |
| `--ink-2` | `#42576A` | secondary text |
| `--muted` | `#6B7C8A` | muted/caption text |
| `--rule` | `#DCE3E9` | default border |
| `--rule-soft` | `#EAEFF3` | soft/row divider border |
| `--accent` | `#0E6BA8` | primary action color, links, focus ring, active filter |
| `--accent-2` | `#0A5686` | primary button hover |
| `--accent-soft` | `#E6F1F8` | accent-tinted background (active chips, edit-band header, focus ring tint) |
| `--accent-line` | `#B9D7EA` | accent-tinted border (saved chips, filtered-total top border) |
| `--ok` | `#1F7A45` | success/positive text |
| `--ok-soft` | `#E7F2EB` | success pill background |
| `--warn` | `#A65D00` | warning text |
| `--warn-soft` | `#FBEFE0` | warning pill/notice background |
| `--crit` | `#B3261E` | critical/error text |
| `--crit-soft` | `#FBE9E7` | critical pill/notice background |
| `--add` | `#6B3FA0` | "added by dealer" accent (tag, border, row accent) |
| `--add-soft` | `#F0EAF8` | "added" tinted background |

## Colors — dark (`prefers-color-scheme:dark` and `[data-theme="dark"]`, identical values)

| Token | Value |
|---|---|
| `--canvas` | `#0C1319` |
| `--surface` | `#141D25` |
| `--surface-2` | `#19242D` |
| `--bar` | `#080F14` |
| `--bar-ink` | `#9FB4C4` |
| `--ink` | `#E2EAF0` |
| `--ink-2` | `#AEC0CE` |
| `--muted` | `#8296A6` |
| `--rule` | `#26343F` |
| `--rule-soft` | `#1D2831` |
| `--accent` | `#4FA3D6` |
| `--accent-2` | `#79BCE5` |
| `--accent-soft` | `#122A3A` |
| `--accent-line` | `#20455C` |
| `--ok` | `#5FBA84` |
| `--ok-soft` | `#132720` |
| `--warn` | `#D9A05B` |
| `--warn-soft` | `#2A2015` |
| `--crit` | `#E08A84` |
| `--crit-soft` | `#2C1917` |
| `--add` | `#A487D0` |
| `--add-soft` | `#211B2E` |

Dark mode is fully specified in the HTML (not "derive") — activates automatically via
`prefers-color-scheme:dark` unless `data-theme="light"` is forced, or explicitly via
`data-theme="dark"` (the in-app theme toggle button sets this attribute directly).

## One-off colors not in the token set

| Value | Used for |
|---|---|
| `#5FB0DE` | logo accent span ("plan" in "VECVplan"), login screen only |
| `#B7CDDD` | login cycle-chip text |
| `linear-gradient(150deg,#0B1822 0%,#12293A 55%,#0E3A4A 100%)` | login page background |
| `#F6FAFD` | grid row hover background (light mode only, hardcoded, not a var) |
| `#F0F7FC` | grid sticky first-column hover background (light mode only, hardcoded) |
| `#BCC8D2` | custom scrollbar thumb (grid-wrap) |
| `#D97706` | 90–180 day stock-aging bar segment (hardcoded, distinct from `--warn`) |
| segment dot colors | Runner = `--ok` bg `--ok-soft`; Repeater = `--warn` bg `--warn-soft`; Stranger = `--crit` bg `--crit-soft` |

## Typography

- Font families: `'IBM Plex Sans',system-ui,-apple-system,Segoe UI,sans-serif` (`--ui`, body/UI
  text); `'IBM Plex Mono',ui-monospace,Menlo,monospace` (`--mono`, all numeric/quantity/code values
  — `font-variant-numeric:tabular-nums` applied wherever mono numbers appear).
- Base body size: `13.5px`, line-height `1.45`.
- Font sizes observed (px): 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16,
  17, 19, 21, 23, 24, 27.
  - Largest: `.home-head h1` (page title) `24px`/weight 600, letter-spacing `-.4px`.
  - `.big` KPI numbers `27px`/weight 600 (`.big.sm` variant `21px`), mono, tabular-nums.
  - `.lg-card h1` (login title) `19px`/weight 600.
  - `.mhead h3` (modal title) `17px`/weight 600.
  - `.dr-head h3` (drawer title) `15.5px`/weight 600.
  - Body/labels mostly `12px`–`13.5px`, weight 400–600.
  - Small caption/meta text `9px`–`11.5px` (e.g. `.cp-c`, `.acell .ao`, `.sortbtn .ar`).
- Font weights used: 400, 500, 600, 700.
- Uppercase letter-spaced labels (section headers, band headers, pills): `letter-spacing` ranges
  `.05em`–`.11em`, always paired with `text-transform:uppercase` and weight 700.

## Spacing rhythm

Recurring gap/padding values (px) across the stylesheet: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
14, 15, 16, 17, 18, 20, 22, 24, 26, 32, 56. No single consistent base unit is enforced — values
cluster around a ~1px-granular scale rather than a strict 4/8px grid (e.g. `padding:16px 17px
15px`, `gap:11px`). Page-level padding: `.home-inner{padding:20px 32px 56px}`. Card padding:
`.card{padding:16px 17px 15px}`. Control heights: buttons `32px` (`.btn`), small buttons `27px`
(`.btn-sm`), inputs `38px` (login), `32px` (search/select), grid rows `40px` (`38px` header,
`26px` band header), compact grid rows `31px`.

## Radii

| Value | Used for |
|---|---|
| `3px` | small elements (meter bar, pills, seg-dots, addtag) |
| `4px` | cellin (quantity input), ms-search input |
| `5px` | buttons, most inputs, selects, rail toggle, filter chips (base) |
| `6px` | notices, addlist, drawer-adjacent panels |
| `7px` | proto-strip, accwrap |
| `8px` | cards, grid-wrap scrollbar thumb radius 5 (see below), colpop |
| `9px` | login card |
| `10px` | modal box (`.mbox`) |
| `13px` | filter token chip (`.ftok`, pill-shaped) |
| `16px` | user chip (`.tb-user`, pill-shaped) |
| `50%` | avatar circle (`.tb-av`) |

## Shadows

| Token | Value |
|---|---|
| `--shadow` (light) | `0 1px 2px rgba(16,32,45,.06), 0 2px 8px rgba(16,32,45,.06)` |
| `--shadow-lg` (light) | `0 12px 40px rgba(16,32,45,.22)` |
| `--shadow` (dark) | `0 1px 2px rgba(0,0,0,.4)` |
| `--shadow-lg` (dark) | `0 12px 40px rgba(0,0,0,.55)` |
| commit bar shadow (hardcoded) | `0 -2px 8px rgba(16,32,45,.05)` |

## Breakpoints

| Breakpoint | Behavior |
|---|---|
| `max-width:760px` | `.card.lead`/`.card.full` collapse from `grid-column:span 2` / `1/-1` to `span 1` (single column cards) |
| `max-width:900px` | FilterRail becomes an absolutely-positioned overlay (`position:absolute`, `box-shadow:var(--shadow-lg)`) instead of pushing layout; TopBar hides all status segments after the first (`.tb-status .seg:nth-child(n+2){display:none}`); search input narrows from `246px` to `160px` |
| `prefers-reduced-motion:reduce` | all transitions disabled (`*{transition:none!important}`) |
| `prefers-color-scheme:dark` | dark palette applied automatically unless `data-theme="light"` is set |

No `sm:`/`md:`/`lg:`/`xl:` Tailwind-style breakpoint ladder is present — this prototype uses two
raw max-width breakpoints only. styling-engineer will need to decide how these map onto the
project's mobile-first Tailwind breakpoints (AGENTS.md §4/§12), especially since IndentGrid itself
is explicitly not mobile-optimized (`min-width:960px`, horizontal scroll).

## Unmapped (styling-engineer to decide semantic name)

| Raw value | Where used | Note |
|---|---|---|
| `--add` / `--add-soft` (purple, `#6B3FA0`/`#F0EAF8`) | "Added by dealer" tag, row accent, Add FERT button | Doesn't correspond to any of AGENTS.md §4's listed semantic tokens (surface/fg/border/primary/danger/success/warning/focus) — needs a new semantic name (e.g. `accent-add`) or a decision to reuse an existing one |
| `#D97706` (90–180D stock bar segment) | StockAgingCard bar | Distinct from `--warn` (`#A65D00`) despite both being "warning-ish" — likely should collapse onto the `warning` token, or be a distinct `warning-strong` step |
| `#F6FAFD` / `#F0F7FC` (grid row/sticky-col hover, light mode only, no dark equivalent defined) | IndentGrid hover states | Not theme-aware — needs a token so dark mode gets a matching hover treatment |
| Segment dot mapping (Runner/Repeater/Stranger → ok/warn/crit) | seg-dot, demand-mix bar | Business-meaning colors (good/fair/poor demand pattern) piggybacking on status tokens — confirm this reuse is intentional, not coincidental |

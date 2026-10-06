# Component Owners — Demand Planning Workbench (Dealer persona, Phase 0)

Kinds: **presentational** = props in, JSX out, no store/query hooks · **connected** = uses
`useAppSelector`/RTK Query hooks · **page** = composition of widgets only · **excluded** = not part
of the production component inventory (see note).

| Component | Slice / segment | Kind | Owner | Depends on (must obey import matrix) |
|---|---|---|---|---|
| LoginForm | `features/auth-login/ui` | connected | coder | `entities/session` (login mutation via `auth-login`'s own `authApi`), `shared/ui` (Button, Input) |
| TopBar | `widgets/topbar/ui` | connected | coder | `entities/session`, `entities/cycle`, `shared/ui` (Button, Badge), `shared/lib/format` |
| PersonaSwitcher | — (excluded) | excluded | — | prototype-only navigation control per components.md's own note ("Persona switching lives here, not in the product chrome") — not planned |
| HomeDashboard | `pages/home/ui` (`HomePage.tsx`) | page | coder | `widgets/topbar`, `widgets/home-summary`, `widgets/plan-performance`, `widgets/accuracy-summary`, `widgets/rollup`, `features/export-indent` |
| IndentProgressCard | `widgets/home-summary/ui` | connected | coder | `entities/cycle`, `shared/ui` (Badge, Button) |
| VerticalsSummaryCard | `widgets/home-summary/ui` | connected | coder | `entities/cycle`, `shared/ui` (Badge, Button) |
| NeedsAttentionCard | `widgets/home-summary/ui` | connected | coder | `entities/indent-line`, `shared/ui` (Button) |
| IndentVsDemandCard | `widgets/plan-performance/ui` | connected | coder | `entities/indent-line`, `shared/ui` (Badge), `shared/lib/format` |
| StockAgingCard | `widgets/plan-performance/ui` | connected | coder | `entities/indent-line`, `shared/ui` (Button) |
| DemandMixCard | `widgets/plan-performance/ui` | connected | coder | `entities/indent-line` |
| AbpPlaceholderCard | `widgets/plan-performance/ui` | presentational | component-generator | `shared/ui` only (static copy, no data) |
| IndentAccuracyCard | `widgets/accuracy-summary/ui` | connected | coder | `entities/accuracy`, `shared/ui` (Badge, Button) |
| AccuracyReportPanel | `widgets/accuracy-summary/ui` | connected | coder | `entities/accuracy`, `entities/dealer` (outlet names), `shared/ui` (Badge) |
| RollupTable | `widgets/rollup/ui` | connected | coder | `entities/indent-line` |
| FilterRail | `features/filter-indent/ui` | connected | coder | `entities/indent-line` (facet counts), `shared/ui` (Button, Select) |
| MultiSelectFilter | `features/filter-indent/ui` | presentational | component-generator | `shared/ui` (Input, Button) |
| WorkbookToolbar | `widgets/workbook-toolbar/ui` | connected | coder | `entities/indent-line`, `features/filter-indent`, `features/add-fert-line`, `features/export-indent`, `shared/ui` (Select, Input, Button) |
| ColumnsPopover | `widgets/workbook-toolbar/ui` | presentational | component-generator | `shared/ui` (Button) |
| IndentGrid | `widgets/indent-grid/ui` | connected | coder | `entities/indent-line`, `features/edit-indent-line`, `shared/ui` (Button) |
| EditableQtyCell | `features/edit-indent-line/ui` | presentational | component-generator | `shared/ui` (Input) — inferred from IndentGrid's "Reuses" list; not separately cataloged in components.md |
| CommitBar | `features/submit-indent/ui` | connected | coder | `entities/cycle`, `shared/ui` (Button) |
| LineDetailDrawer | `widgets/indent-grid/ui` | connected | coder | `entities/indent-line`, `shared/ui` (Button) |
| AddFertModal | `features/add-fert-line/ui` | connected | coder | `features/add-fert-line` own api, `shared/ui` (Input, Button, Modal) |
| ExportModal | `features/export-indent/ui` | connected | coder | `features/export-indent` lib, `shared/ui` (Button, Modal) |
| ReviewSubmitModal | `features/submit-indent/ui` | connected | coder | `features/submit-indent` own api, `shared/ui` (Button, Modal) |
| Toast | `shared/ui` | presentational | component-generator | none (renders a message string passed by the app-level toast host) |
| Button | `shared/ui` | presentational | component-generator | — |
| Select | `shared/ui` | presentational | component-generator | — |
| Input | `shared/ui` | presentational | component-generator | — |
| Badge (pill) | `shared/ui` | presentational | component-generator | — |
| Modal (dialog shell) | `shared/ui` | presentational | component-generator | — |

## Non-component work

| Work item | Owner |
|---|---|
| `app/store` root, `combineSlices`, `RootState`/`AppStore`/`AppDispatch` types, `entities/session/model/sessionSlice.ts`, all `entities/*/api/*.ts` and `features/*/api/*.ts` (RTK Query `injectEndpoints`) | store-architect |
| `tailwind.config.ts`, `src/shared/ui/theme/**` (semantic tokens backing Badge tones, focus ring, contrast) | styling-engineer |
| `src/app/router.tsx` (route table, `RequireAuth` layout route, lazy routes + `errorElement`), `src/app/providers/**` (`ThemeProvider`, toast host), `src/shared/config/routes.ts` extension (`signIn`, `home`, `workbook`) | app-bootstrap |
| `test/**`, `*.test.ts(x)` for every component above, `e2e/**` smoke specs for `/sign-in`, `/`, `/workbook` | test-engineer |
| `*.stories.tsx` for every `presentational`/`component-generator`-owned row above | component-generator |

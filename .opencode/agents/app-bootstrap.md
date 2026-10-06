---
description: Owns tooling and the composition root. Run 1 (Phase 0) installs pinned deps and writes every project config (Vite, Vitest, TS, ESLint+Steiger, PostCSS, Storybook, Playwright, env, logger, tools/ scripts), runs `msw init`, creates the working branch. Run B branches (and retrofits scripts) for every other mode. Run 2 wires main.tsx, App.tsx, router.tsx and providers — incrementally as page TASKs pass, then a final check.
mode: subagent
# model: opencode-go/deepseek-v4-flash
permission:
  edit:
    "*": deny
    "package.json": allow
    "vite.config.ts": allow
    "tsconfig.json": allow
    "tsconfig.*.json": allow
    "eslint.config.js": allow
    "steiger.config.ts": allow
    "postcss.config.js": allow
    "index.html": allow
    ".env.example": allow
    ".gitignore": allow
    ".storybook/**": allow
    "src/vite-env.d.ts": allow
    "src/app/main.tsx": allow
    "src/app/App.tsx": allow
    "src/app/router.tsx": allow
    "src/app/providers/**": allow
    "src/shared/config/**": allow
    "src/shared/lib/logger/**": allow
    "tools/**": allow
    "playwright.config.ts": allow
    ".nvmrc": allow
  bash:
    "*": allow
    "git push*": deny
    "git reset --hard*": deny
    "git rebase*": deny
    "git clean*": deny
    "git checkout --*": deny
    "git commit --amend*": deny
    "rm *": deny
    "sed -i*": deny
    "perl -i*": deny
    "perl -pi*": deny
    "git add -A*": deny
    "git add .": deny
    "git add --all*": deny
    "git commit -a*": deny
---

# App Bootstrap

## Run 1 — Phase 0

Everything below was verified end-to-end on a reference app built from these templates
(typecheck, ESLint + Steiger, Vitest + coverage, build, Storybook build). Copy it exactly; if you
must deviate, say why in the HANDOFF reason.

### 0. Preconditions
`node -v` must be ≥ 22.22 (or ≥ 24.15) — jsdom 30 and Steiger 0.7 require it. Lower → BLOCKED
("Node <v> — install Node 22.22+ or 24.15+"). Never install Node yourself.

### 1. Branch
`git checkout -b feat/<run-name>` (name from orchestrator). Never work on `main`.

### 2. package.json + dependencies (pinned majors — AGENTS.md §1)
Empty repo: `npm init -y`, then set `"type": "module"` (every config file below is ESM),
`"private": true`, and `"engines": { "node": ">=22.22" }`. Write `.nvmrc` containing `22`.
Existing package.json: check with `npm ls <pkg>`; install only what's missing. A DIFFERENT major
already installed → do not change it; report it in the HANDOFF reason.

```bash
npm i react@^19 react-dom@^19 @reduxjs/toolkit@^2 react-redux@^9 react-router@^7 react-error-boundary@^5 \
  react-hook-form@^7 zod@^4 @hookform/resolvers@^5
npm i -D typescript@^5 vite@^6 @vitejs/plugin-react@^4 @types/react@^19 @types/react-dom@^19 @types/node \
  tailwindcss@^3.4 postcss@^8 autoprefixer@^10 \
  vitest@^3 @vitest/coverage-v8@^3 jsdom@^30 @testing-library/react@^16 @testing-library/dom@^10 \
  @testing-library/jest-dom@^6 @testing-library/user-event@^14 \
  msw@^2 @faker-js/faker@^9 \
  eslint@^9 @eslint/js@^9 typescript-eslint@^8 eslint-plugin-react-hooks@^5 eslint-plugin-jsx-a11y@^6 globals@^17 \
  steiger@^0.7 @feature-sliced/steiger-plugin@^0.8 \
  storybook@^8 @storybook/react-vite@^8 @storybook/addon-essentials@^8 @storybook/addon-a11y@^8 \
  @storybook/addon-themes@^8 @storybook/test@^8 \
  openapi-typescript@^7 @redocly/cli@^2 \
  @playwright/test@^1 @axe-core/playwright@^4
npx msw init public --save          # creates public/mockServiceWorker.js — dev MSW fails without it
npx playwright install chromium     # one browser is enough; needs network (report if it fails, don't retry in a loop)
```

### 3. package.json scripts
```json
{
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "lint": "eslint . && steiger ./src",
  "test": "vitest run",
  "test:watch": "vitest",
  "coverage": "vitest run --coverage",
  "e2e": "playwright test",
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build --quiet"
}
```

### 4. vite.config.ts (Vite + Vitest in one file)
```typescript
/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@app': r('./src/app'), '@pages': r('./src/pages'), '@widgets': r('./src/widgets'),
        '@features': r('./src/features'), '@entities': r('./src/entities'), '@shared': r('./src/shared'),
        '@mocks': r('./mocks'), '@test': r('./test'),
      },
    },
    server: { proxy: env.VITE_API_PROXY_TARGET ? { '/api': { target: env.VITE_API_PROXY_TARGET, changeOrigin: true } } : undefined },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'], // e2e/ belongs to Playwright
      setupFiles: ['./test/setup.ts'],
      env: { VITE_API_BASE_URL: 'http://localhost', VITE_API_MODE: 'mock' },
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.stories.tsx', 'src/**/index.ts', 'src/**/*.d.ts', 'src/shared/api/generated/**',
          'src/app/main.tsx', 'src/app/App.tsx', 'src/app/router.tsx', 'src/app/providers/**'], // app shell: covered by e2e
        thresholds: {
          lines: 70, functions: 70, branches: 70, statements: 70,
          'src/features/**': { lines: 80, functions: 80, branches: 80, statements: 80 },
          'src/widgets/**': { lines: 80, functions: 80, branches: 80, statements: 80 },
        },
      },
    },
  };
});
```
Without `test.include`, Vitest also collects `e2e/*.spec.ts` and fails on Playwright's `test()`.

### 5. tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["vite/client", "node"],
    "paths": {
      "@app/*": ["./src/app/*"], "@pages/*": ["./src/pages/*"], "@widgets/*": ["./src/widgets/*"],
      "@features/*": ["./src/features/*"], "@entities/*": ["./src/entities/*"], "@shared/*": ["./src/shared/*"],
      "@mocks/*": ["./mocks/*"], "@test/*": ["./test/*"]
    }
  },
  "include": ["src", "mocks", "test", "e2e", ".storybook", "*.ts"]
}
```
`src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_MODE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 6. eslint.config.js (flat) — these rules are how the team's contracts are enforced
```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'coverage', 'public', 'playwright-report', 'test-results', 'src/shared/api/generated'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['src/**/*.tsx'],
    ignores: ['src/**/*.test.tsx', 'src/**/*.stories.tsx'],
    rules: {
      'max-lines': ['error', { max: 250 }],
      'no-restricted-globals': ['error', { name: 'fetch', message: 'Use RTK Query hooks (AGENTS.md §3)' }],
      'no-restricted-imports': ['error', { paths: [
        { name: 'axios', message: 'Use RTK Query' },
        { name: '@shared/api/baseApi', message: 'Components use entity/feature hooks, not baseApi' },
      ] }],
      'no-restricted-syntax': ['error',
        { selector: "JSXAttribute[name.name='style']", message: 'Tailwind classes only (AGENTS.md §4)' },
        // hex colors (#fff, #ffffff, bg-[#ff0000]) — not in-page anchors like "#add-to-cart"
        { selector: "Literal[value=/(^|[\\s\\[(:,])#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\\w-])/]", message: 'Use semantic color tokens' },
        { selector: "TemplateElement[value.raw=/(^|[\\s\\[(:,])#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\\w-])/]", message: 'Use semantic color tokens' },
      ],
    },
  },
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.node } },
  { files: ['src/shared/lib/logger/**'], rules: { 'no-console': 'off' } },
);
```
`tseslint.configs.strict` also forbids `!` non-null assertions and `X | void` unions — the
templates in other agents are written to pass it (`at()` fixture helper, params objects).

`steiger.config.ts`:
```typescript
import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
  // A slice with one consumer is normal while TASKs land bottom-up — report it, don't block the loop.
  { rules: { 'fsd/insignificant-slice': 'warn' } },
  // AGENTS.md fixes app/ segments as store/ and providers/ (team-wide contract).
  { files: ['./src/app/**'], rules: { 'fsd/segments-by-purpose': 'off' } },
]);
```
Without these two overrides `npm run lint` fails on every new slice and on `app/store`, and no TASK
can ever pass. Cross-slice and upward imports still fail (verified).

### 7. Other files
- `postcss.config.js`: `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }`
- `index.html`: `<html lang="en">`, viewport meta, `<div id="root"></div>` +
  `<script type="module" src="/src/app/main.tsx"></script>`
- `src/app/main.tsx` PLACEHOLDER so `npm run build` works before Run 2: renders
  `<p>Setup is complete, but no pages are connected yet. Tell the orchestrator: "connect the finished pages".</p>`
  (a person who opens the app early must be told what to do, not just shown "Bootstrapping")
- `.gitignore`: `node_modules dist coverage storybook-static playwright-report test-results .env .env.local`
- `.env.example`: `VITE_API_BASE_URL=`, `VITE_API_MODE=hybrid`, `VITE_API_PROXY_TARGET=https://api.company.com`
- `src/shared/config/env.ts`:
  ```typescript
  type ApiMode = 'mock' | 'hybrid' | 'real';
  const mode = import.meta.env.VITE_API_MODE as string | undefined;
  export const env = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
    apiMode: (['mock', 'hybrid', 'real'].includes(mode ?? '') ? mode : 'mock') as ApiMode,
  } as const;
  ```
  plus `src/shared/config/index.ts` re-export and `routes.ts` (route path constants).
- `src/shared/lib/logger/index.ts`: `logger.debug/info/warn/error(message, meta?)`; debug/info are
  no-ops when `import.meta.env.PROD`.
- `.storybook/main.ts` and `.storybook/preview.ts`:
  ```typescript
  // .storybook/main.ts
  import type { StorybookConfig } from '@storybook/react-vite';
  const config: StorybookConfig = {
    framework: '@storybook/react-vite',
    stories: ['../src/**/*.stories.tsx'],
    core: { disableTelemetry: true },
    addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-themes'],
  };
  export default config;
  ```
  ```typescript
  // .storybook/preview.ts
  import type { Preview } from '@storybook/react';
  import { withThemeByClassName } from '@storybook/addon-themes';
  import '../src/shared/ui/theme/base.css';
  const preview: Preview = {
    decorators: [withThemeByClassName({ themes: { light: '', dark: 'dark' }, defaultTheme: 'light' })],
  };
  export default preview;
  ```
  (base.css is created by styling-engineer in Phase 3a; Storybook isn't built before then.)
- `playwright.config.ts`:
  ```typescript
  import { defineConfig, devices } from '@playwright/test';
  const PORT = 5179;
  export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: true,
    retries: 0,
    reporter: [['list']],
    use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
    projects: [
      { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
      { name: 'mobile', use: { ...devices['Pixel 7'] } },
    ],
    webServer: {
      command: `npm run dev -- --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: false,
      env: { VITE_API_MODE: 'mock', VITE_API_BASE_URL: '' },
    },
  });
  ```
- `tools/list-html-elements.mjs` (coverage-checker and wireframe-analyzer run it):
  ```javascript
  // Usage: node tools/list-html-elements.mjs <file.html>
  // One line per user-visible building block: index | tag | role | #id | data-component | data-state | text
  import { readFileSync } from 'node:fs';
  import { JSDOM } from 'jsdom';

  const [file] = process.argv.slice(2);
  if (!file) { console.error('usage: node tools/list-html-elements.mjs <file.html>'); process.exit(2); }
  const doc = new JSDOM(readFileSync(file, 'utf8')).window.document;
  const sel = 'h1,h2,h3,h4,button,a[href],input,select,textarea,img,table,form,nav,dialog,[role],[data-component],[data-state],[id]';
  doc.querySelectorAll(sel).forEach((el, i) => {
    const text = (el.getAttribute('aria-label') || el.getAttribute('alt') || el.getAttribute('placeholder') || el.textContent || '')
      .trim().replace(/\s+/g, ' ').slice(0, 60);
    console.log([i, el.tagName.toLowerCase(), el.getAttribute('role') ?? '', el.id ? `#${el.id}` : '',
      el.getAttribute('data-component') ?? '', el.getAttribute('data-state') ?? '', text].join(' | '));
  });
  ```
- `tools/check-contrast.mjs` (styling-engineer runs it; WCAG 2.2 AA in light AND dark):
  ```javascript
  // Usage: node tools/check-contrast.mjs [tokens.css] [pairs.json]
  // Text pairs >= 4.5:1, non-text (control borders, focus rings) >= 3:1. Exit 1 on any failure.
  import { readFileSync } from 'node:fs';

  const [tokensPath = 'src/shared/ui/theme/tokens.css', pairsPath = 'src/shared/ui/theme/contrast-pairs.json'] = process.argv.slice(2);
  const css = readFileSync(tokensPath, 'utf8');
  const pairs = JSON.parse(readFileSync(pairsPath, 'utf8'));

  const block = (selector) => {
    const m = css.match(new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`));
    if (!m) return {};
    return Object.fromEntries([...m[1].matchAll(/--color-([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)]
      .map(([, name, r, g, b]) => [name, [Number(r), Number(g), Number(b)]]));
  };
  const lum = ([r, g, b]) => {
    const c = [r, g, b].map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

  const light = block(':root');
  const themes = { light, dark: { ...light, ...block('.dark') } };
  let failures = 0;
  for (const [theme, colors] of Object.entries(themes)) {
    for (const [kind, min] of [['text', 4.5], ['nonText', 3]]) {
      for (const [fg, bg] of pairs[kind] ?? []) {
        if (!colors[fg] || !colors[bg]) { console.log(`MISSING ${theme}: --color-${fg} or --color-${bg}`); failures++; continue; }
        const r = ratio(colors[fg], colors[bg]);
        const ok = r >= min;
        if (!ok) failures++;
        console.log(`${ok ? 'PASS' : 'FAIL'} ${theme.padEnd(5)} ${kind.padEnd(7)} ${fg} on ${bg}: ${r.toFixed(2)} (min ${min})`);
      }
    }
  }
  process.exit(failures ? 1 : 0);
  ```

### 8. Verify, commit
`npm run typecheck && npm run lint && npm test -- --passWithNoTests && npm run build` →
`git add <the files you wrote>` (never `git add -A`) → commit.

## Run 2 — router wiring (incremental after each page TASK; final in Phase 3c)

Two flavours, same files:
- `incremental` (after a page TASK passes review): wire ONLY the pages that exist with a public
  `index.ts`; leave the others out of the router (don't stub them). Missing store/browser mocks → BLOCKED.
- `final` (all TASKs done): confirm `makeStore`/`store` exported from `src/app/store`; `mocks/browser.ts`
  exists; EVERY page in `plan/fsd-structure.md` exists with a public `index.ts`. Missing → BLOCKED.

Existing projects: edit the project's own router/entry files named in PROJECT.md instead of the
FSD paths below (they're in your permissions only if they're under the paths listed; otherwise
return BLOCKED naming the file so the human can widen permissions).

```tsx
// src/app/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { env } from '@shared/config';
import { applyTheme } from '@shared/ui/theme';
import '@shared/ui/theme/base.css';
import { App } from './App';

async function enableMocking() {
  if (!import.meta.env.DEV || env.apiMode === 'real') return; // never in production builds
  const { worker } = await import('@mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' }); // hybrid: real endpoints pass through
}

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

applyTheme('system');
void enableMocking().then(() => {
  createRoot(container).render(<StrictMode><App /></StrictMode>);
});
```

```tsx
// src/app/App.tsx
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router/dom'; // DOM entry of react-router 7
import { ErrorBoundary } from 'react-error-boundary';
import { store } from './store';
import { router } from './router';
import { AppCrashFallback } from './providers/AppCrashFallback';

export function App() {
  return (
    <ErrorBoundary FallbackComponent={AppCrashFallback}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ErrorBoundary>
  );
}
```

```tsx
// src/app/router.tsx — one lazy route per page in plan/fsd-structure.md
import { createBrowserRouter } from 'react-router';
import { routes } from '@shared/config';
import { RequireAuth } from './providers/RequireAuth';
import { RouteErrorFallback } from './providers/RouteErrorFallback';

export const router = createBrowserRouter([
  {
    path: routes.products,
    lazy: async () => ({ Component: (await import('@pages/products')).ProductsPage }),
    errorElement: <RouteErrorFallback />,
  },
  {
    element: <RequireAuth />, // guarded group — only when the plan has a session entity + sign-in route
    errorElement: <RouteErrorFallback />,
    children: [
      { path: routes.account, lazy: async () => ({ Component: (await import('@pages/account')).AccountPage }) },
    ],
  },
  { path: '*', lazy: async () => ({ Component: (await import('@pages/not-found')).NotFoundPage }) },
]);
```

```tsx
// src/app/providers/RequireAuth.tsx — pathless layout route (verified with a redirect test)
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAppSelector } from '@shared/lib/store';
import { sessionSlice } from '@entities/session';
import { routes } from '@shared/config';

export function RequireAuth() {
  const isAuthenticated = useAppSelector(sessionSlice.selectors.selectIsAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to={routes.signIn} replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
```
The sign-in page returns the user to `location.state.from` after `signedIn`. No session entity in
the plan → omit the guarded group and RequireAuth.

`providers/AppCrashFallback.tsx` and `RouteErrorFallback.tsx`: semantic tokens, `role="alert"`,
a reload/back button, error logged via `logger.error` — no stack traces shown to users.

Verify: `npm run typecheck && npm run lint && npm test && npm run build` → commit your files by path.
The reviewer runs `npm run e2e` at release; the incremental flavour makes finished routes testable early.

## Run B — Branch + retrofit (ALWAYS first in feature / bugfix / gap-fill)

1. **Branch (always).** Base branch = `base-branch` in PROJECT.md (new-project repos: `main`).
   - `git status --porcelain` not empty → BLOCKED ("uncommitted changes on <branch>") — never stash or discard.
   - Already on a `feat/*` or `fix/*` branch that plan/PROGRESS.md names for this run → stay on it.
   - Otherwise `git checkout <base-branch> && git checkout -b <feat|fix>/<name>` (name from orchestrator).
   - Never create commits on the base branch.
2. **Retrofit (only if PROJECT.md reports missing scripts).** Goal: make the standard command names
   exist so every agent's permissions and instructions work — WITHOUT changing the project's tools.
   For each gate in PROJECT.md's command map marked "no → retrofit", add an npm script under the
   AGENTS.md §6 name that calls the project's existing tool, e.g.
   `"typecheck": "tsc --noEmit"`, `"coverage": "jest --coverage --watchAll=false"`.
   Never overwrite an existing script; never add a new tool or dependency.
3. Add `tools/check-contrast.mjs` if styling-engineer is part of the run, and
   `tools/list-html-elements.mjs` if HTML screens are part of the run — whichever doesn't exist
   (coverage-checker has no fallback runner). If `jsdom` isn't installed, say so in the HANDOFF —
   coverage-checker will use its grep fallback.
4. If a gate needs a tool the project doesn't have (e.g. no linter at all), don't install it —
   list it in the HANDOFF so the human can decide.
5. Run the new scripts once; commit (skip the commit if nothing changed).

## Never
- Touch `src/app/store/**`, slices, api, components, tests, mocks
- Business logic in App/router/providers
- Enable MSW in production; use `process.env` in `src/`
- Upgrade an existing dependency major without human approval

## Return (last line)
- Run 1: `HANDOFF: status=DONE next=orchestrator task=none reason="deps + configs + msw init + branch feat/<name>; typecheck/lint/build clean"`
- Run 2: `HANDOFF: status=DONE next=orchestrator task=none reason="main/App/router wired, <N> routes, build clean"`
- Run 2 incremental: `HANDOFF: status=DONE next=orchestrator task=none reason="wired <N> of <M> pages, build clean"`
- Run B: `HANDOFF: status=DONE next=orchestrator task=none reason="branch <name> from <base>; added scripts: <list|none>; not available: <list|none>"`
- `HANDOFF: status=BLOCKED next=orchestrator task=none reason="<missing store export / mocks/browser.ts / page / conflicting dep major / uncommitted changes>"`

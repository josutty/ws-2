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

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
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

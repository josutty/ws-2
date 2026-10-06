import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
  // A slice with one consumer is normal while TASKs land bottom-up — report it, don't block the loop.
  { rules: { 'fsd/insignificant-slice': 'warn' } },
  // AGENTS.md fixes app/ segments as store/ and providers/ (team-wide contract).
  { files: ['./src/app/**'], rules: { 'fsd/segments-by-purpose': 'off' } },
]);

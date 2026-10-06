import type { CurrentCyclePreview } from '@shared/api/generated/models';
import { CLOSES_AT } from '../constants';

export const buildCurrentCyclePreview = (overrides: Partial<CurrentCyclePreview> = {}): CurrentCyclePreview => ({
  cycleLabel: 'S&OP-1A · Jul 2026',
  closesAt: CLOSES_AT,
  ...overrides,
});

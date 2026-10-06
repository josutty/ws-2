import { env } from '@shared/config';
import type { ApiErrorBody } from '@shared/api/generated/models';

const API_PREFIX = '/api/v1';

export const apiUrl = (path: string) => `${env.apiBaseUrl}${API_PREFIX}${path}`;

// Fixed instant used everywhere instead of Date.now() so fixtures/handlers stay deterministic.
export const REFERENCE_DATE = new Date('2026-07-01T06:00:00+05:30');

/** Typed index access for fixtures — strict lint forbids `!`, and noUncheckedIndexedAccess makes `[0]` possibly undefined. */
export const at = <T>(items: readonly T[], index: number): T => {
  const item = items[index];
  if (item === undefined) throw new Error(`fixture index ${index} out of range (${items.length} items)`);
  return item;
};

export const buildApiError = (
  overrides: Partial<ApiErrorBody> & Pick<ApiErrorBody, 'errorCode' | 'category' | 'message'>,
): ApiErrorBody => ({
  retryable: false,
  requestId: `req-mock-${overrides.errorCode.toLowerCase()}`,
  ...overrides,
});

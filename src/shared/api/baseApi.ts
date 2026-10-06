import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs } from '@reduxjs/toolkit/query/react';
import { env } from '@shared/config';
import { toApiError, type ApiError } from './errors';
import { sessionExpired } from './events';

// Kept in sync with mocks/lib.ts's own API_PREFIX — both must match the real server's base path
// (plan/generated/endpoints-map.json "servers": [".../api/v1"]).
const API_PREFIX = '/api/v1';

// No dealer-scoped "current cycle" endpoint exists yet (see plan/store-design.md, "cycleId
// convention"). Every `:cycleId` path placeholder resolves to this sentinel, mirroring
// GET /cycles/current's own unauthenticated "current" convention. Phase 0 is single-cycle-per-
// dealer, so this is safe for the mock world; revisit once a real multi-cycle backend lands.
const CURRENT_CYCLE_ID = 'current';

const resolvePlaceholders = (url: string, dealerId: string | null | undefined): string =>
  url.replace(':dealerId', dealerId ? encodeURIComponent(dealerId) : '').replace(':cycleId', CURRENT_CYCLE_ID);

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${env.apiBaseUrl}${API_PREFIX}`,
  timeout: 15_000,
  prepareHeaders: (headers, { getState }) => {
    // loosely typed on purpose: shared/ must not import RootState from app/
    const token = (getState() as { session?: { token?: string | null } }).session?.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (args, api, extra) => {
  const dealerId = (api.getState() as { session?: { dealerId?: string | null } }).session?.dealerId;
  const resolvedArgs =
    typeof args === 'string' ? resolvePlaceholders(args, dealerId) : { ...args, url: resolvePlaceholders(args.url, dealerId) };
  const result = await rawBaseQuery(resolvedArgs, api, extra);
  if (result.error) {
    // `login` itself returns 401 for bad credentials — that's not an expired session.
    if (result.error.status === 401 && api.endpoint !== 'login') api.dispatch(sessionExpired());
    return { error: toApiError(result.error), meta: result.meta };
  }
  return { data: result.data, meta: result.meta };
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Session', 'CyclePreview', 'DealerCycleSummary', 'Outlet', 'IndentLine', 'AvailableProduct', 'AccuracyHistory', 'SubmitPreview'],
  endpoints: () => ({}),
});

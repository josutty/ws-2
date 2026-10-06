import { baseApi, type GetCurrentCyclePreviewResponse, type GetDealerCycleSummaryResponse } from '@shared/api';

export const cycleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCurrentCyclePreview: build.query<GetCurrentCyclePreviewResponse, Record<string, never>>({
      query: () => '/cycles/current',
      providesTags: ['CyclePreview'],
    }),
    getDealerCycleSummary: build.query<GetDealerCycleSummaryResponse, Record<string, never>>({
      query: () => '/dealers/:dealerId/cycles/:cycleId/summary',
      providesTags: ['DealerCycleSummary'],
    }),
  }),
});

export const { useGetCurrentCyclePreviewQuery, useGetDealerCycleSummaryQuery } = cycleApi;

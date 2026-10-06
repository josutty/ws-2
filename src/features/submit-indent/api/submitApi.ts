import {
  baseApi,
  type GetDealerSubmitPreviewResponse,
  type ReopenDealerIndentResponse,
  type SubmitDealerIndentResponse,
  type SubmitRequest,
} from '@shared/api';

export const submitApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDealerSubmitPreview: build.query<GetDealerSubmitPreviewResponse, Record<string, never>>({
      query: () => '/dealers/:dealerId/cycles/:cycleId/submit-preview',
      providesTags: ['SubmitPreview'],
    }),
    submitDealerIndent: build.mutation<SubmitDealerIndentResponse, SubmitRequest>({
      query: (body) => ({ url: '/dealers/:dealerId/cycles/:cycleId/submit', method: 'POST', body }),
      invalidatesTags: (result) => (result ? ['DealerCycleSummary', { type: 'IndentLine', id: 'LIST' }] : []),
    }),
    reopenDealerIndent: build.mutation<ReopenDealerIndentResponse, SubmitRequest>({
      query: (body) => ({ url: '/dealers/:dealerId/cycles/:cycleId/reopen', method: 'POST', body }),
      invalidatesTags: (result) => (result ? ['DealerCycleSummary', { type: 'IndentLine', id: 'LIST' }] : []),
    }),
  }),
});

export const { useGetDealerSubmitPreviewQuery, useSubmitDealerIndentMutation, useReopenDealerIndentMutation } = submitApi;

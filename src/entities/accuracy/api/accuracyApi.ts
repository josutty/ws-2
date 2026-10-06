import { baseApi, type GetDealerAccuracyHistoryParams, type GetDealerAccuracyHistoryResponse } from '@shared/api';

export const accuracyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDealerAccuracyHistory: build.query<GetDealerAccuracyHistoryResponse, GetDealerAccuracyHistoryParams>({
      query: (params) => ({ url: '/dealers/:dealerId/accuracy-history', params }),
      providesTags: ['AccuracyHistory'],
    }),
  }),
});

export const { useGetDealerAccuracyHistoryQuery } = accuracyApi;

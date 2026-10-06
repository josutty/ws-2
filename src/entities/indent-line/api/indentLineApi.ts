import { baseApi, type ListDealerIndentLinesParams, type ListDealerIndentLinesResponse } from '@shared/api';

export const indentLineApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listDealerIndentLines: build.query<ListDealerIndentLinesResponse, ListDealerIndentLinesParams>({
      query: (params) => ({ url: '/dealers/:dealerId/cycles/:cycleId/indent-lines', params }),
      providesTags: (result) => [
        { type: 'IndentLine', id: 'LIST' },
        ...(result?.items.map(({ lineId }) => ({ type: 'IndentLine' as const, id: lineId })) ?? []),
      ],
    }),
  }),
});

export const { useListDealerIndentLinesQuery } = indentLineApi;

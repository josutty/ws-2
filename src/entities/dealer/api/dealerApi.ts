import { baseApi, type ListDealerOutletsResponse } from '@shared/api';

export const dealerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listDealerOutlets: build.query<ListDealerOutletsResponse, Record<string, never>>({
      query: () => '/dealers/:dealerId/outlets',
      providesTags: (result) => [
        { type: 'Outlet', id: 'LIST' },
        ...(result?.items.map(({ outletId }) => ({ type: 'Outlet' as const, id: outletId })) ?? []),
      ],
    }),
  }),
});

export const { useListDealerOutletsQuery } = dealerApi;

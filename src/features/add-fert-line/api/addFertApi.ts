import {
  baseApi,
  type AddDealerIndentLineResponse,
  type AddIndentLineRequest,
  type ListAvailableProductsParams,
  type ListAvailableProductsResponse,
} from '@shared/api';

export const addFertApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listAvailableProducts: build.query<ListAvailableProductsResponse, ListAvailableProductsParams>({
      query: (params) => ({ url: '/dealers/:dealerId/catalogue/available-products', params }),
      providesTags: [{ type: 'AvailableProduct', id: 'LIST' }],
    }),
    addDealerIndentLine: build.mutation<AddDealerIndentLineResponse, AddIndentLineRequest>({
      query: (body) => ({ url: '/dealers/:dealerId/cycles/:cycleId/indent-lines', method: 'POST', body }),
      invalidatesTags: (result) => (result ? [{ type: 'IndentLine', id: 'LIST' }] : []),
    }),
  }),
});

export const { useListAvailableProductsQuery, useAddDealerIndentLineMutation } = addFertApi;

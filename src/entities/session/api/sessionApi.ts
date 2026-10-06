import { baseApi, type GetCurrentUserResponse } from '@shared/api';

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCurrentUser: build.query<GetCurrentUserResponse, Record<string, never>>({
      query: () => '/users/me',
      providesTags: ['Session'],
    }),
  }),
});

export const { useGetCurrentUserQuery } = sessionApi;

import { baseApi, type LoginRequest, type LoginResponse } from '@shared/api';
import { signedIn } from '@entities/session';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Session'],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(signedIn({ token: data.accessToken, dealerId: data.user.dealerMemberId }));
        } catch {
          // login failed — LoginForm reads the mutation hook's own `error` state
        }
      },
    }),
  }),
});

export const { useLoginMutation } = authApi;

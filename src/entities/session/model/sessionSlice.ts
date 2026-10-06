import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { sessionExpired } from '@shared/api';
import { sessionApi } from '../api/sessionApi';

export type AuthStatus = 'anonymous' | 'authenticated' | 'expired';

interface SessionState {
  token: string | null;
  dealerId: string | null;
  authStatus: AuthStatus;
}

const initialState: SessionState = { token: null, dealerId: null, authStatus: 'anonymous' };

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<{ token: string; dealerId: string }>) {
      state.token = action.payload.token;
      state.dealerId = action.payload.dealerId;
      state.authStatus = 'authenticated';
    },
    signedOut: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionExpired, () => ({ ...initialState, authStatus: 'expired' }))
      .addMatcher(sessionApi.endpoints.getCurrentUser.matchFulfilled, (state, action) => {
        state.dealerId = action.payload.dealerMemberId;
        state.authStatus = 'authenticated';
      });
  },
  selectors: {
    selectToken: (s) => s.token,
    selectDealerId: (s) => s.dealerId,
    selectAuthStatus: (s) => s.authStatus,
    selectIsAuthenticated: (s) => s.authStatus === 'authenticated',
  },
});

export const { signedIn, signedOut } = sessionSlice.actions;

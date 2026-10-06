import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '@shared/api';
import { sessionSlice } from '@entities/session';
import { rejectionLogger } from './middleware';

export const rootReducer = combineSlices(baseApi, sessionSlice);

export const makeStore = (preloadedState?: Partial<ReturnType<typeof rootReducer>>) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (gDM) => gDM().concat(baseApi.middleware, rejectionLogger),
  });
  setupListeners(store.dispatch);
  return store;
};

export const store = makeStore();

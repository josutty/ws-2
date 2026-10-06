import type { makeStore, rootReducer } from './index';

declare global {
  type RootState = ReturnType<typeof rootReducer>;
  type AppStore = ReturnType<typeof makeStore>;
  type AppDispatch = AppStore['dispatch'];
}

export {};

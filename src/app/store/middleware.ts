import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';
import { logger } from '@shared/lib/logger';

export const rejectionLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) logger.warn('api rejected', { type: action.type, payload: action.payload });
  return next(action);
};

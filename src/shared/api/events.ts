// Lets shared/api signal upward (e.g. a 401) without importing entities/session.
import { createAction } from '@reduxjs/toolkit';

export const sessionExpired = createAction('api/sessionExpired');

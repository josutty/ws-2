import { http, HttpResponse } from 'msw';
import type { ApiErrorBody, CurrentCyclePreview, CurrentUser, LoginRequest, LoginResult } from '@shared/api/generated/models';
import { db } from '../db';
import { apiUrl, buildApiError } from '../lib';
import { DEALER_CODE, DEMO_PASSWORD } from '../constants';

export const identityMockHandlers = [
  http.post<never, LoginRequest, LoginResult | ApiErrorBody>(apiUrl('/auth/login'), async ({ request }) => {
    const body = await request.json();
    const knownIdentifiers = [DEALER_CODE, `${DEALER_CODE}@example.com`];
    if (!knownIdentifiers.includes(body.identifier)) {
      return HttpResponse.json(
        buildApiError({
          errorCode: 'ERR_UNKNOWN_IDENTIFIER',
          category: 'AUTHENTICATION',
          message: "We don't recognise that dealer code.",
        }),
        { status: 401 },
      );
    }
    if (body.password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        buildApiError({
          errorCode: 'ERR_WRONG_PASSWORD',
          category: 'AUTHENTICATION',
          message: 'Incorrect password. 4 attempts left before the account locks.',
        }),
        { status: 401 },
      );
    }
    return HttpResponse.json({ accessToken: 'mock-access-token', user: db.user });
  }),

  http.get<never, never, CurrentCyclePreview>(apiUrl('/cycles/current'), () => HttpResponse.json(db.cyclePreview)),
];

export const identityRealHandlers = [
  http.get<never, never, CurrentUser>(apiUrl('/users/me'), () => HttpResponse.json(db.user)),
];

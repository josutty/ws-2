import { delay, http, HttpResponse } from 'msw';
import { apiUrl, buildApiError } from './lib';

const serverError = (message: string) =>
  HttpResponse.json(buildApiError({ errorCode: 'ERR_INTERNAL', category: 'SERVER_FAULT', retryable: true, message }), { status: 500 });

const networkError = () => HttpResponse.error();

export const scenarios = {
  // Identity
  loginUnknownIdentifier: [
    http.post(apiUrl('/auth/login'), () =>
      HttpResponse.json(
        buildApiError({ errorCode: 'ERR_UNKNOWN_IDENTIFIER', category: 'AUTHENTICATION', message: "We don't recognise that dealer code." }),
        { status: 401 },
      ),
    ),
  ],
  loginWrongPassword: [
    http.post(apiUrl('/auth/login'), () =>
      HttpResponse.json(
        buildApiError({
          errorCode: 'ERR_WRONG_PASSWORD',
          category: 'AUTHENTICATION',
          message: 'Incorrect password. 4 attempts left before the account locks.',
        }),
        { status: 401 },
      ),
    ),
  ],
  loginServerError: [http.post(apiUrl('/auth/login'), () => serverError('Sign-in is unavailable right now.'))],

  cyclePreviewServerError: [http.get(apiUrl('/cycles/current'), () => serverError('Could not load the current cycle.'))],
  currentUserServerError: [http.get(apiUrl('/users/me'), () => serverError('Could not load your profile.'))],

  // Dealer profile
  outletsServerError: [http.get(apiUrl('/dealers/:dealerId/outlets'), () => serverError('Could not load your outlets.'))],
  outletsEmpty: [http.get(apiUrl('/dealers/:dealerId/outlets'), () => HttpResponse.json({ items: [] }))],

  // Dealer indent
  cycleSummaryServerError: [
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/summary'), () => serverError('Could not load your indent summary.')),
  ],
  indentLinesServerError: [
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () => serverError('Could not load your indent lines.')),
  ],
  indentLinesNetworkError: [http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), networkError)],
  indentLinesEmpty: [
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () =>
      HttpResponse.json({ page: 0, size: 50, totalElements: 0, items: [] }),
    ),
  ],
  indentLinesSlow: [
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), async () => {
      await delay('infinite');
      return HttpResponse.json({ page: 0, size: 50, totalElements: 0, items: [] });
    }),
  ],
  addIndentLineConflict: [
    http.post(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () =>
      HttpResponse.json(
        buildApiError({ errorCode: 'ERR_LINE_EXISTS', category: 'CONFLICT', message: 'Combination already exists.' }),
        { status: 409 },
      ),
    ),
  ],
  updateIndentCellConflict: [
    http.put(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines/:lineId'), () =>
      HttpResponse.json(
        buildApiError({
          errorCode: 'ERR_OPTIMISTIC_LOCK',
          category: 'CONFLICT',
          retryable: true,
          message: 'This cell changed since you loaded it. Reload and try again.',
        }),
        { status: 409 },
      ),
    ),
  ],
  batchUpdateCellsPartialReject: [
    http.put(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines/batch'), () =>
      HttpResponse.json(
        {
          saved: [],
          rejected: [
            {
              periodId: '2026-07-W1',
              error: buildApiError({
                errorCode: 'ERR_OPTIMISTIC_LOCK',
                category: 'CONFLICT',
                retryable: true,
                message: 'This cell changed since you loaded it.',
              }),
            },
          ],
        },
        { status: 207 },
      ),
    ),
  ],
  availableProductsServerError: [
    http.get(apiUrl('/dealers/:dealerId/catalogue/available-products'), () => serverError('Could not load the catalogue.')),
  ],
  availableProductsEmpty: [
    http.get(apiUrl('/dealers/:dealerId/catalogue/available-products'), () =>
      HttpResponse.json({ page: 0, size: 50, totalElements: 0, items: [] }),
    ),
  ],

  // Accuracy
  accuracyHistoryServerError: [
    http.get(apiUrl('/dealers/:dealerId/accuracy-history'), () => serverError('Could not load accuracy history.')),
  ],
  accuracyHistoryEmpty: [
    http.get(apiUrl('/dealers/:dealerId/accuracy-history'), () => HttpResponse.json({ groupBy: 'fert', rows: [] })),
  ],

  // Submission
  submitPreviewServerError: [
    http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/submit-preview'), () => serverError('Could not load the submission preview.')),
  ],
  submitConflict: [
    http.post(apiUrl('/dealers/:dealerId/cycles/:cycleId/submit'), () =>
      HttpResponse.json(
        buildApiError({ errorCode: 'ERR_ALREADY_SUBMITTED', category: 'CONFLICT', message: 'This indent has already been submitted.' }),
        { status: 409 },
      ),
    ),
  ],
  reopenConflict: [
    http.post(apiUrl('/dealers/:dealerId/cycles/:cycleId/reopen'), () =>
      HttpResponse.json(
        buildApiError({
          errorCode: 'ERR_NOT_SUBMITTED',
          category: 'CONFLICT',
          message: 'This indent has not been submitted, so it cannot be reopened.',
        }),
        { status: 409 },
      ),
    ),
  ],
};

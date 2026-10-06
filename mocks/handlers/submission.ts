import { http, HttpResponse } from 'msw';
import type {
  ApiErrorBody,
  ReopenResult,
  SubmitPreview,
  SubmitRequest,
  SubmitResult,
} from '@shared/api/generated/models';
import { db } from '../db';
import { apiUrl, buildApiError, REFERENCE_DATE } from '../lib';
import { CLOSES_AT, RECIPIENT } from '../constants';

export const submissionRealHandlers = [
  http.get<{ dealerId: string; cycleId: string }, never, SubmitPreview>(
    apiUrl('/dealers/:dealerId/cycles/:cycleId/submit-preview'),
    () => HttpResponse.json(db.submitPreview),
  ),

  http.post<{ dealerId: string; cycleId: string }, SubmitRequest, SubmitResult | ApiErrorBody>(
    apiUrl('/dealers/:dealerId/cycles/:cycleId/submit'),
    async ({ request }) => {
      const body = await request.json();
      if (db.cycleSummary.status === 'SUBMITTED') {
        return HttpResponse.json(
          buildApiError({ errorCode: 'ERR_ALREADY_SUBMITTED', category: 'CONFLICT', message: 'This indent has already been submitted.' }),
          { status: 409 },
        );
      }
      db.cycleSummary.status = 'SUBMITTED';
      db.cycleSummary.permissions.canEdit = false;
      db.cycleSummary.permissions.canSubmit = false;
      return HttpResponse.json({
        taskId: body.taskId,
        status: 'SUBMITTED',
        submittedAt: REFERENCE_DATE.toISOString(),
        recipient: RECIPIENT,
        reopenUntil: CLOSES_AT,
      });
    },
  ),
];

export const submissionMockHandlers = [
  http.post<{ dealerId: string; cycleId: string }, SubmitRequest, ReopenResult | ApiErrorBody>(
    apiUrl('/dealers/:dealerId/cycles/:cycleId/reopen'),
    async ({ request }) => {
      const body = await request.json();
      if (db.cycleSummary.status !== 'SUBMITTED') {
        return HttpResponse.json(
          buildApiError({
            errorCode: 'ERR_NOT_SUBMITTED',
            category: 'CONFLICT',
            message: 'This indent has not been submitted, so it cannot be reopened.',
          }),
          { status: 409 },
        );
      }
      db.cycleSummary.status = 'DRAFT';
      db.cycleSummary.permissions.canEdit = true;
      db.cycleSummary.permissions.canSubmit = true;
      return HttpResponse.json({
        taskId: body.taskId,
        status: 'REOPENED',
        reopenedAt: REFERENCE_DATE.toISOString(),
        reopenUntil: CLOSES_AT,
      });
    },
  ),
];

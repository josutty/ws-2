import { http, HttpResponse } from 'msw';
import type { AccuracyHistoryResponse, ApiErrorBody } from '@shared/api/generated/models';
import { db } from '../db';
import { apiUrl, buildApiError } from '../lib';

export const accuracyHandlers = [
  http.get<{ dealerId: string }, never, AccuracyHistoryResponse | ApiErrorBody>(
    apiUrl('/dealers/:dealerId/accuracy-history'),
    ({ request }) => {
      const url = new URL(request.url);
      const groupBy = url.searchParams.get('groupBy');
      const cycles = Number(url.searchParams.get('cycles') ?? 4);

      if (groupBy !== 'outlet' && groupBy !== 'fert') {
        return HttpResponse.json(
          buildApiError({ errorCode: 'ERR_INVALID_QUERY', category: 'CLIENT_FAULT', message: 'groupBy must be "outlet" or "fert".' }),
          { status: 400 },
        );
      }

      const rows = groupBy === 'outlet' ? db.accuracyByOutlet : db.accuracyByFert;
      return HttpResponse.json({
        groupBy,
        rows: rows.map((row) => ({ ...row, history: row.history.slice(-cycles) })),
      });
    },
  ),
];

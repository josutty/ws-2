import { http, HttpResponse } from 'msw';
import type {
  AddIndentLineRequest,
  ApiErrorBody,
  AvailableProductPage,
  DealerCycleSummary,
  IndentBatchResult,
  IndentBatchUpdate,
  IndentCell,
  IndentCellUpdate,
  IndentLine,
  IndentLinePage,
} from '@shared/api/generated/models';
import { db } from '../db';
import { apiUrl, at, buildApiError, REFERENCE_DATE } from '../lib';
import { buildAddedIndentLine } from '../factories/indentLine';

export const dealerIndentRealHandlers = [
  http.get<{ dealerId: string; cycleId: string }, never, DealerCycleSummary>(
    apiUrl('/dealers/:dealerId/cycles/:cycleId/summary'),
    () => HttpResponse.json(db.cycleSummary),
  ),

  http.get<{ dealerId: string; cycleId: string }, never, IndentLinePage>(
    apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'),
    ({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? 0);
      const size = Number(url.searchParams.get('size') ?? 50);
      const search = url.searchParams.get('search')?.toLowerCase() ?? '';
      const [sortField, sortDirection] = (url.searchParams.get('sort') ?? '').split(',');

      let items = db.indentLines.filter(
        (line) =>
          search === '' ||
          line.product.fertCode.toLowerCase().includes(search) ||
          line.product.description.toLowerCase().includes(search),
      );

      if (sortField === 'vehicleDescription') {
        items = [...items].sort((a, b) => a.product.description.localeCompare(b.product.description));
        if (sortDirection === 'desc') items.reverse();
      }

      const start = page * size;
      return HttpResponse.json({ page, size, totalElements: items.length, items: items.slice(start, start + size) });
    },
  ),

  http.post<{ dealerId: string; cycleId: string }, AddIndentLineRequest, IndentLine | ApiErrorBody>(
    apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'),
    async ({ request }) => {
      const body = await request.json();
      const alreadyIndented = db.indentLines.some((line) => line.product.memberId === body.productMemberId);
      const productIndex = db.availableProducts.findIndex((product) => product.memberId === body.productMemberId);

      if (alreadyIndented || productIndex === -1) {
        return HttpResponse.json(
          buildApiError({ errorCode: 'ERR_LINE_EXISTS', category: 'CONFLICT', message: 'Combination already exists.' }),
          { status: 409 },
        );
      }

      const product = at(db.availableProducts.splice(productIndex, 1), 0);
      const newLine = buildAddedIndentLine(product);
      db.indentLines.push(newLine);
      db.cycleSummary.lines = db.indentLines.length;
      return HttpResponse.json(newLine, { status: 201 });
    },
  ),

  http.put<{ dealerId: string; cycleId: string; lineId: string }, IndentCellUpdate, IndentCell | ApiErrorBody>(
    apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines/:lineId'),
    async ({ request, params }) => {
      const body = await request.json();
      const line = db.indentLines.find((l) => l.lineId === params.lineId);
      if (line === undefined) {
        return HttpResponse.json(
          buildApiError({ errorCode: 'ERR_NOT_FOUND', category: 'CLIENT_FAULT', message: 'Indent line not found.' }),
          { status: 404 },
        );
      }
      const period = line.periods.find((p) => p.periodId === body.periodId);
      if (period === undefined) {
        return HttpResponse.json(
          buildApiError({ errorCode: 'ERR_NOT_FOUND', category: 'CLIENT_FAULT', message: 'Period not found on this line.' }),
          { status: 404 },
        );
      }
      if (body.expectedVersion !== line.version) {
        return HttpResponse.json(
          buildApiError({
            errorCode: 'ERR_OPTIMISTIC_LOCK',
            category: 'CONFLICT',
            retryable: true,
            message: 'This cell changed since you loaded it. Reload and try again.',
          }),
          { status: 409 },
        );
      }

      period.value = body.value;
      line.version += 1;
      return HttpResponse.json({
        factId: `fact-${line.lineId}-${period.periodId}`,
        measure: 'DomDealerIndent',
        periodId: period.periodId,
        productMemberId: line.product.memberId,
        orgMemberId: params.dealerId,
        value: period.value,
        version: line.version,
        updatedAt: REFERENCE_DATE.toISOString(),
      });
    },
  ),

  http.put<{ dealerId: string; cycleId: string }, IndentBatchUpdate, IndentBatchResult>(
    apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines/batch'),
    async ({ request, params }) => {
      const body = await request.json();
      const saved: IndentCell[] = [];
      const rejected: IndentBatchResult['rejected'] = [];

      for (const cell of body.cells) {
        const line = db.indentLines.find((l) => l.product.memberId === cell.productMemberId);
        const period = line?.periods.find((p) => p.periodId === cell.periodId);

        if (line === undefined || period === undefined) {
          rejected.push({
            periodId: cell.periodId,
            error: buildApiError({ errorCode: 'ERR_NOT_FOUND', category: 'CLIENT_FAULT', message: 'Line or period not found.' }),
          });
          continue;
        }
        if (cell.expectedVersion !== line.version) {
          rejected.push({
            periodId: cell.periodId,
            error: buildApiError({
              errorCode: 'ERR_OPTIMISTIC_LOCK',
              category: 'CONFLICT',
              retryable: true,
              message: 'This cell changed since you loaded it.',
            }),
          });
          continue;
        }

        period.value = cell.value;
        line.version += 1;
        saved.push({
          factId: `fact-${line.lineId}-${period.periodId}`,
          measure: 'DomDealerIndent',
          periodId: period.periodId,
          productMemberId: line.product.memberId,
          orgMemberId: params.dealerId,
          value: period.value,
          version: line.version,
          updatedAt: REFERENCE_DATE.toISOString(),
        });
      }

      return HttpResponse.json({ saved, rejected }, { status: rejected.length > 0 ? 207 : 200 });
    },
  ),
];

export const dealerIndentMockHandlers = [
  http.get<{ dealerId: string }, never, AvailableProductPage>(
    apiUrl('/dealers/:dealerId/catalogue/available-products'),
    ({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? 0);
      const size = Number(url.searchParams.get('size') ?? 50);
      const search = url.searchParams.get('search')?.toLowerCase() ?? '';

      const items = db.availableProducts.filter(
        (product) =>
          search === '' || product.fertCode.toLowerCase().includes(search) || product.description.toLowerCase().includes(search),
      );
      const start = page * size;
      return HttpResponse.json({ page, size, totalElements: items.length, items: items.slice(start, start + size) });
    },
  ),
];

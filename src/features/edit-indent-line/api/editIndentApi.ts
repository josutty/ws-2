import { baseApi, type IndentBatchResult, type IndentBatchUpdate, type IndentCell, type IndentCellUpdate } from '@shared/api';
import { indentLineApi } from '@entities/indent-line';

export interface UpdateDealerIndentCellArgs {
  lineId: string;
  body: IndentCellUpdate;
}

export const editIndentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateDealerIndentCell: build.mutation<IndentCell, UpdateDealerIndentCellArgs>({
      query: ({ lineId, body }) => ({ url: `/dealers/:dealerId/cycles/:cycleId/indent-lines/${lineId}`, method: 'PUT', body }),
      onQueryStarted: async ({ lineId, body }, { dispatch, getState, queryFulfilled }) => {
        const cachedArgs = indentLineApi.util.selectCachedArgsForQuery(getState() as RootState, 'listDealerIndentLines');
        const patches = cachedArgs.map((arg) =>
          dispatch(
            indentLineApi.util.updateQueryData('listDealerIndentLines', arg, (draft) => {
              const line = draft.items.find((item) => item.lineId === lineId);
              const period = line?.periods.find((p) => p.periodId === body.periodId);
              if (period) period.value = body.value;
            }),
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => { patch.undo(); });
        }
      },
      invalidatesTags: (_result, error, { lineId }) => (error ? [] : [{ type: 'IndentLine', id: lineId }]),
    }),
    batchUpdateDealerIndentCells: build.mutation<IndentBatchResult, IndentBatchUpdate>({
      query: (body) => ({ url: '/dealers/:dealerId/cycles/:cycleId/indent-lines/batch', method: 'PUT', body }),
      invalidatesTags: (result) => (result ? [{ type: 'IndentLine', id: 'LIST' }] : []),
    }),
  }),
});

export const { useUpdateDealerIndentCellMutation, useBatchUpdateDealerIndentCellsMutation } = editIndentApi;

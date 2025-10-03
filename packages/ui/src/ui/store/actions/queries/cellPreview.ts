import {batch} from 'react-redux';

import {
    CellPreviewActionType,
    cellPreviewCancelHelper,
    openCellPreview,
} from '../modals/cell-preview';
import {isCancelled} from '../../../utils/cancel-helper';
import {CELL_PREVIEW, PREVIEW_LIMIT} from '../../../constants/modals/cell-preview';
import {readQueryResults} from './api';
import {prepareFormattedValue} from '../../../utils/queries/format';
import {CellDataHandlerQueries} from '../../../types/navigation/table-cell-preview';

export const onCellPreviewQueryResults = (
    queryId: string,
    queryIndex: number,
    opts: {columnName: string; rowIndex: number; page: number; pageSize: number},
    dataHandler?: CellDataHandlerQueries,
): CellPreviewActionType => {
    return async (dispatch) => {
        const {columnName, rowIndex, page, pageSize} = opts;

        if (dataHandler) {
            dataHandler.onStartLoading({columnName, rowIndex});
        } else {
            batch(() => {
                dispatch({type: CELL_PREVIEW.REQUEST, data: {}});
                dispatch(openCellPreview());
            });
        }

        const cancellation =
            dataHandler?.saveCancellation ?? cellPreviewCancelHelper.removeAllAndSave;

        try {
            const start = page * pageSize + rowIndex;
            const response = await dispatch(
                readQueryResults(
                    queryId,
                    queryIndex,
                    {start, end: start + 1},
                    [columnName],
                    {cellsSize: PREVIEW_LIMIT, stringLimit: Math.round(PREVIEW_LIMIT / 10)},
                    cancellation,
                ),
            );

            if (dataHandler) {
                return await dataHandler.onSuccess({columnName, rowIndex, data: response});
            }

            const dataRow: unknown = response.rows[0][columnName][0];
            const typeIndex = response.rows[0][columnName][1];

            const type = response.yql_type_registry[Number(typeIndex)];

            const {$type, $tag, $value} = prepareFormattedValue(dataRow, type, {
                maxListSize: undefined,
                maxStringSize: undefined,
                treatValAsData: true,
            });

            dispatch({
                type: CELL_PREVIEW.SUCCESS,
                data: {data: {$value: $tag ? $value.$value : $value, $type: $type, $tag}},
            });
        } catch (error: any) {
            if (!isCancelled(error)) {
                if (dataHandler) {
                    dataHandler?.onError({columnName, rowIndex, error});
                } else {
                    dispatch({type: CELL_PREVIEW.FAILURE, data: {error}});
                }
            }
        }
    };
};

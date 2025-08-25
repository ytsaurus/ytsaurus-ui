import {
    CellPreviewActionType,
    cellPreviewCancelHelper,
    openCellPreview,
} from '../../../../store/actions/modals/cell-preview';
import {isCancelled} from '../../../../utils/cancel-helper';
import {CELL_PREVIEW, PREVIEW_LIMIT} from '../../../../constants/modals/cell-preview';
import {readQueryResults} from '../api';
import {prepareFormattedValue} from '../query_result/utils/format';
import {batch} from 'react-redux';

export const onCellPreviewQueryResults = (
    queryId: string,
    queryIndex: number,
    options: {columnName: string; rowIndex: number},
): CellPreviewActionType => {
    return async (dispatch) => {
        batch(() => {
            dispatch({type: CELL_PREVIEW.REQUEST, data: {}});
            dispatch(openCellPreview());
        });

        try {
            const response = await dispatch(
                readQueryResults(
                    queryId,
                    queryIndex,
                    {start: options.rowIndex, end: options.rowIndex + 1},
                    [options.columnName],
                    {cellsSize: PREVIEW_LIMIT, stringLimit: Math.round(PREVIEW_LIMIT / 10)},
                    cellPreviewCancelHelper.removeAllAndSave,
                ),
            );

            const dataRow: unknown = response.rows[0][options.columnName][0];
            const typeIndex = response.rows[0][options.columnName][1];

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
                dispatch({type: CELL_PREVIEW.FAILURE, data: {error}});
            }
        }
    };
};

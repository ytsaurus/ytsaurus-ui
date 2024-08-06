import {
    CellPreviewActionType,
    cellPreviewCancelHelper,
    openCellPreview,
} from '../../../../store/actions/modals/cell-preview';
import {isCancelled} from '../../../../utils/cancel-helper';
import {CELL_PREVIEW, PREVIEW_LIMIT} from '../../../../constants/modals/cell-preview';
import {readQueryResults} from '../api';

export const showQueryTrackerCellPreviewModal = (
    queryId: string,
    queryIndex: number,
    options: {columnName: string; rowIndex: number},
): CellPreviewActionType => {
    return async (dispatch) => {
        dispatch(openCellPreview());

        try {
            const response = await dispatch(
                readQueryResults(
                    queryId,
                    queryIndex,
                    {start: options.rowIndex, end: options.rowIndex + 1},
                    [options.columnName],
                    {cellsSize: PREVIEW_LIMIT},
                    cellPreviewCancelHelper.removeAllAndSave,
                ),
            );

            const data = (response.rows[0][options.columnName][0] as any[])[0].val;

            dispatch({type: CELL_PREVIEW.SUCCESS, data: {data}});
        } catch (error: any) {
            if (!isCancelled(error)) {
                dispatch({type: CELL_PREVIEW.FAILURE, data: {error}});
            }
        }
    };
};

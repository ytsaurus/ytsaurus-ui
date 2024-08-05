import {ytApiV4} from '../../../../rum/rum-wrap-api';
import {getPath} from '../../../selectors/navigation';
import {batch} from 'react-redux';
import {getDefaultRequestOutputFormat} from '../../../../utils/navigation/content/table/table';
import {CELL_PREVIEW, PREVIEW_LIMIT} from '../../../../constants/modals/cell-preview';
import {isCancelled} from '../../../../utils/cancel-helper';
import {
    CellPreviewActionType,
    cellPreviewCancelHelper,
    openCellPreview,
} from '../../modals/cell-preview';

export const showCellPreviewModal = (columnName: string, index: number): CellPreviewActionType => {
    return async (dispatch, getState) => {
        const path = getPath(getState());

        const cellPath = `${path}{${columnName}}[#${index}:#${index + 1}]`;

        const ytCliDownloadCommand = `yt read-table '${cellPath}' --format json`;

        batch(() => {
            dispatch({type: CELL_PREVIEW.REQUEST, data: {ytCliDownloadCommand}});
            dispatch(openCellPreview());
        });

        try {
            const json = await ytApiV4.readTable({
                parameters: {
                    path: cellPath,
                    output_format: getDefaultRequestOutputFormat({
                        stringLimit: PREVIEW_LIMIT,
                    }),
                },
                cancellation: cellPreviewCancelHelper.removeAllAndSave,
            });

            const parsed = JSON.parse(json);

            const data = parsed.rows[0][columnName];

            const isIncomplete = data.$incomplete;
            const noticeText = isIncomplete
                ? 'Unable to load content more than 16MiB. Please use the command bellow to load it locally.'
                : 'You could use the command bellow to load it locally.';

            dispatch({type: CELL_PREVIEW.SUCCESS, data: {data, noticeText}});
        } catch (error: any) {
            if (!isCancelled(error)) {
                dispatch({type: CELL_PREVIEW.FAILURE, data: {error}});
            }
        }
    };
};

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
import unipika from '../../../../common/thor/unipika';
import {getOffsetValue} from '../../../selectors/navigation/content/table';

export const showCellPreviewModal = (columnName: string, index: number): CellPreviewActionType => {
    return async (dispatch, getState) => {
        const path = getPath(getState());
        const offset = getOffsetValue(getState());

        const rowIndex = typeof offset === 'number' ? index + offset : index;

        const cellPath = `${path}{${columnName}}[#${rowIndex}:#${rowIndex + 1}]`;

        const ytCliDownloadCommand = `yt read-table '${cellPath}' --format json`;

        batch(() => {
            dispatch({type: CELL_PREVIEW.REQUEST, data: {ytCliDownloadCommand}});
            dispatch(openCellPreview());
        });

        const output_format: any = getDefaultRequestOutputFormat({
            stringLimit: PREVIEW_LIMIT,
        });

        output_format.$attributes.value_format = 'yql';

        try {
            const json = await ytApiV4.readTable({
                parameters: {
                    path: cellPath,
                    output_format,
                },
                cancellation: cellPreviewCancelHelper.removeAllAndSave,
            });

            const parsed = JSON.parse(json);

            const column = parsed.rows[0][columnName];

            const value = column[0];
            const typeIndex = column[1];

            const {$type} = unipika.converters.yql([value, parsed.yql_type_registry[typeIndex]], {
                maxStringSize: undefined,
                maxListSize: undefined,
                treatValAsData: true,
            });

            const isIncomplete = column.$incomplete;
            const noticeText = isIncomplete
                ? 'Unable to load content more than 16MiB. Please use the command bellow to load it locally.'
                : 'You could use the command bellow to load it locally.';

            dispatch({
                type: CELL_PREVIEW.SUCCESS,
                data: {data: {$type, $value: value}, noticeText},
            });
        } catch (error: any) {
            if (!isCancelled(error)) {
                dispatch({type: CELL_PREVIEW.FAILURE, data: {error}});
            }
        }
    };
};

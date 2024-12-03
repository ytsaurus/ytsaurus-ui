import {getPath} from '../../../../selectors/navigation';
import {batch} from 'react-redux';
import {getDefaultRequestOutputFormat} from '../../../../../utils/navigation/content/table/table';
import {CELL_PREVIEW, PREVIEW_LIMIT} from '../../../../../constants/modals/cell-preview';
import {isCancelled} from '../../../../../utils/cancel-helper';
import {
    CellPreviewActionType,
    cellPreviewCancelHelper,
    openCellPreview,
} from '../../../modals/cell-preview';
import unipika from '../../../../../common/thor/unipika';
import {getIsDynamic} from '../../../../selectors/navigation/content/table-ts';
import {
    getDynamicTableCellPath,
    getDynamicTableCliCommand,
    loadDynamicTableCellPreview,
} from './dynamic-table';
import {
    getStaticTableCellPath,
    getStaticTableCliCommand,
    loadStaticTableCellPreview,
} from './static-table';

const getCellPath = ({
    columnName,
    index,
}: {
    columnName: string;
    index: number;
}): CellPreviewActionType => {
    return (dispatch, getState) => {
        const path: string = getPath(getState());
        const isDynamic = getIsDynamic(getState());

        const action = isDynamic ? getDynamicTableCellPath : getStaticTableCellPath;

        return dispatch(action({path, columnName, index}));
    };
};

const getCliCommand = ({cellPath}: {cellPath: string}): CellPreviewActionType => {
    return (_dispatch, getState) => {
        const isDynamic = getIsDynamic(getState());

        const fn = isDynamic ? getDynamicTableCliCommand : getStaticTableCliCommand;

        return fn({cellPath});
    };
};

const loadCellPreview = ({cellPath}: {cellPath: string}): CellPreviewActionType => {
    return (dispatch, getState) => {
        const isDynamic = getIsDynamic(getState());

        const output_format: any = getDefaultRequestOutputFormat({
            stringLimit: PREVIEW_LIMIT,
        });

        output_format.$attributes.value_format = 'yql';

        const action = isDynamic ? loadDynamicTableCellPreview : loadStaticTableCellPreview;

        return dispatch(
            action({
                cellPath,
                output_format,
                cancellation: cellPreviewCancelHelper.removeAllAndSave,
            }),
        );
    };
};

export const showCellPreviewModal = (columnName: string, index: number): CellPreviewActionType => {
    return async (dispatch) => {
        const cellPath = dispatch(getCellPath({columnName, index}));

        const ytCliDownloadCommand: string = dispatch(getCliCommand({cellPath}));

        batch(() => {
            dispatch({type: CELL_PREVIEW.REQUEST, data: {ytCliDownloadCommand}});
            dispatch(openCellPreview());
        });

        try {
            const json = await dispatch(loadCellPreview({cellPath}));

            const parsed = JSON.parse(json);

            const column = parsed.rows[0][columnName];

            const value = column[0];
            const typeIndex = column[1];

            const {$type, $value} = unipika.converters.yql(
                [value, parsed.yql_type_registry[typeIndex]],
                {
                    maxStringSize: undefined,
                    maxListSize: undefined,
                    treatValAsData: true,
                },
            );

            const isIncomplete = column.$incomplete;
            const noticeText = isIncomplete
                ? 'Unable to load content more than 16MiB. Please use the command bellow to load it locally.'
                : 'You could use the command bellow to load it locally.';

            dispatch({
                type: CELL_PREVIEW.SUCCESS,
                data: {data: {$type, $value}, noticeText},
            });
        } catch (error: any) {
            if (!isCancelled(error)) {
                dispatch({type: CELL_PREVIEW.FAILURE, data: {error}});
            }
        }
    };
};

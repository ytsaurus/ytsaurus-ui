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
import {getDynamicTableCellPath, getDynamicTableCliCommand} from './dynamic-table';
import {getStaticTableCellPath, getStaticTableCliCommand} from './static-table';
import {isYqlTypesEnabled} from '../../../../selectors/navigation/content/table';
import {readStaticTable} from '../../content/table/readStaticTable';
import {readDynamicTable} from '../../content/table/readDynamicTable';

const getCellPath = ({
    columnName,
    rowIndex,
}: {
    columnName: string;
    rowIndex: number;
}): CellPreviewActionType<string> => {
    return (dispatch, getState) => {
        const path: string = getPath(getState());
        const isDynamic = getIsDynamic(getState());

        const action = isDynamic ? getDynamicTableCellPath : getStaticTableCellPath;

        return dispatch(action({path, columnName, rowIndex}));
    };
};

const getCliCommand = ({
    cellPath,
    columnName,
    tag,
}: {
    cellPath: string;
    columnName: string;
    tag?: string;
}): CellPreviewActionType<string> => {
    return (_dispatch, getState) => {
        const isDynamic = getIsDynamic(getState());

        const fn = isDynamic ? getDynamicTableCliCommand : getStaticTableCliCommand;

        return fn({cellPath, columnName, tag});
    };
};

const loadCellPreview = ({
    cellPath,
    useYqlTypes,
}: {
    cellPath: string;
    useYqlTypes: boolean;
}): CellPreviewActionType<ReturnType<typeof readDynamicTable>> => {
    return (_dispatch, getState) => {
        const isDynamic = getIsDynamic(getState());

        const output_format = getDefaultRequestOutputFormat({
            stringLimit: PREVIEW_LIMIT,
            useYqlTypes,
        });

        return isDynamic
            ? readDynamicTable({
                  setup: {},
                  parameters: {
                      output_format,
                      query: cellPath,
                  },
                  cancellation: cellPreviewCancelHelper.removeAllAndSave,
              })
            : readStaticTable({
                  setup: {},
                  parameters: {path: cellPath, output_format},
                  cancellation: cellPreviewCancelHelper.removeAllAndSave,
              });
    };
};

export const onCellPreview = ({
    columnName,
    rowIndex,
    tag,
}: {
    columnName: string;
    rowIndex: number;
    tag?: string;
}): CellPreviewActionType => {
    return async (dispatch, getState) => {
        const useYqlTypes = isYqlTypesEnabled(getState());

        const cellPath = dispatch(getCellPath({columnName, rowIndex}));

        const ytCliDownloadCommand: string = dispatch(getCliCommand({cellPath, columnName, tag}));

        batch(() => {
            dispatch({type: CELL_PREVIEW.REQUEST, data: {ytCliDownloadCommand}});
            dispatch(openCellPreview());
        });

        const data: {
            $type?: string;
            $value?: any;
            $tag?: string;
        } = {};

        let isIncomplete: boolean | undefined = false;

        try {
            const loadedData = await dispatch(loadCellPreview({cellPath, useYqlTypes}));

            if (loadedData.useYqlTypes) {
                const {rows, yqlTypes} = loadedData;
                const column = rows[0][columnName];
                const value = column[0];
                const typeIndex = column[1];

                const flags: {incomplete: boolean} = {incomplete: false};

                const {$type, $value, $tag} = unipika.converters.yql(
                    [value, yqlTypes?.[typeIndex]],
                    {
                        maxStringSize: undefined,
                        maxListSize: undefined,
                        treatValAsData: true,
                    },
                    flags,
                );

                isIncomplete = flags.incomplete;

                data.$type = $type;
                data.$value = $tag ? $value.$value : $value;
                data.$tag = $tag;
            } else {
                const {rows} = loadedData;
                const column = rows[0][columnName];

                const hasType = column && column.$type;

                data.$type = column.$type;
                data.$value = hasType ? column.$value : column;

                isIncomplete = column.$incomplete;
            }

            const noticeText = isIncomplete
                ? 'Unable to load content more than 16MiB. Please use the command bellow to load it locally.'
                : 'You could use the command bellow to load it locally.';

            dispatch({
                type: CELL_PREVIEW.SUCCESS,
                data: {
                    data,
                    noticeText,
                },
            });
        } catch (error: any) {
            if (!isCancelled(error)) {
                dispatch({type: CELL_PREVIEW.FAILURE, data: {error}});
            }
        }
    };
};

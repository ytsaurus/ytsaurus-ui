import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../reducers';
import {ytApiV4} from '../../../../rum/rum-wrap-api';
import {getPath} from '../../../selectors/navigation';
import {batch} from 'react-redux';
import {getDefaultRequestOutputFormat} from '../../../../utils/navigation/content/table/table';
import {
    type CellPreviewAction,
    initialState,
} from '../../../reducers/navigation/modals/cell-preview';
import {CELL_PREVIEW} from '../../../../constants/navigation/modals/cell-preview';
import CancelHelper, {isCancelled} from '../../../../utils/cancel-helper';

type ActionType<R = any> = ThunkAction<R, RootState, any, CellPreviewAction>;

const PREVIEW_LIMIT = 16 * 1024 * 1024; // 16MiB;

const cancelHelper = new CancelHelper();

const openCellPreview = (): CellPreviewAction => {
    return {
        type: CELL_PREVIEW.PARTITION,
        data: {visible: true},
    };
};

export const closeCellPreview = (): CellPreviewAction => {
    return {
        type: CELL_PREVIEW.PARTITION,
        data: {visible: false},
    };
};

export const closeCellPreviewAndCancelRequest = (): ActionType => {
    return (dispatch) => {
        cancelHelper.removeAllRequests();

        batch(() => {
            dispatch({type: CELL_PREVIEW.PARTITION, data: initialState});
            dispatch(closeCellPreview());
        });
    };
};

export const showCellPreviewModal = (columnName: string, index: number): ActionType => {
    return async (dispatch, getState) => {
        const path = getPath(getState());

        const cellPath = `${path}{${columnName}}[#${index}:#${index + 1}]`;

        batch(() => {
            dispatch({type: CELL_PREVIEW.REQUEST, data: {cellPath}});
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
                cancellation: cancelHelper.removeAllAndSave,
            });

            const parsed = JSON.parse(json);

            const data = parsed.rows[0][columnName];
            dispatch({type: CELL_PREVIEW.SUCCESS, data: {data}});
        } catch (error: any) {
            if (!isCancelled(error)) {
                dispatch({type: CELL_PREVIEW.FAILURE, data: {error}});
            }
        }
    };
};

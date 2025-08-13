import CancelHelper from '../../../utils/cancel-helper';
import {CellPreviewAction, initialState} from '../../reducers/modals/cell-preview';
import {CELL_PREVIEW} from '../../../constants/modals/cell-preview';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import {batch} from 'react-redux';

export type CellPreviewActionType<R = unknown> = ThunkAction<R, RootState, any, CellPreviewAction>;

export const cellPreviewCancelHelper = new CancelHelper();
export const openCellPreview = (): CellPreviewAction => {
    return {
        type: CELL_PREVIEW.PARTITION,
        data: {visible: true},
    };
};
const closeCellPreview = (): CellPreviewAction => {
    return {
        type: CELL_PREVIEW.PARTITION,
        data: {visible: false},
    };
};
export const closeCellPreviewAndCancelRequest = (): CellPreviewActionType => {
    return (dispatch) => {
        cellPreviewCancelHelper.removeAllRequests();

        batch(() => {
            dispatch({type: CELL_PREVIEW.PARTITION, data: initialState});
            dispatch(closeCellPreview());
        });
    };
};

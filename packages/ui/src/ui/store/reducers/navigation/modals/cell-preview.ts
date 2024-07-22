import type {ActionD, YTError} from '../../../../types';
import {CELL_PREVIEW} from '../../../../constants/navigation/modals/cell-preview';

export interface CellPreviewState {
    visible: boolean;
    loading: boolean;
    data: any | undefined;
    cellPath: string;
    error?: YTError;
}

export const initialState: CellPreviewState = {
    visible: false,
    loading: false,
    data: undefined,
    cellPath: '',
};

export default function cellPreviewReducer(
    state = initialState,
    action: CellPreviewAction,
): CellPreviewState {
    switch (action.type) {
        case CELL_PREVIEW.REQUEST: {
            return {...state, cellPath: action.data.cellPath, loading: true, error: undefined};
        }
        case CELL_PREVIEW.SUCCESS: {
            return {...state, data: action.data.data, loading: false};
        }
        case CELL_PREVIEW.FAILURE: {
            return {...state, error: action.data.error, loading: false};
        }
        case CELL_PREVIEW.PARTITION: {
            return {...state, ...action.data};
        }
        default: {
            return state;
        }
    }
}

export type CellPreviewAction =
    | ActionD<typeof CELL_PREVIEW.REQUEST, Pick<CellPreviewState, 'cellPath'>>
    | ActionD<typeof CELL_PREVIEW.SUCCESS, Pick<CellPreviewState, 'data'>>
    | ActionD<typeof CELL_PREVIEW.FAILURE, Pick<CellPreviewState, 'error'>>
    | ActionD<typeof CELL_PREVIEW.PARTITION, Partial<CellPreviewState>>;

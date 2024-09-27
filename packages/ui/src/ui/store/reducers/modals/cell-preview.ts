import type {ActionD, YTError} from '../../../types';
import {CELL_PREVIEW} from '../../../constants/modals/cell-preview';

export interface CellPreviewState {
    visible: boolean;
    loading: boolean;
    data: {$value: any; $type: string} | undefined;
    ytCliDownloadCommand?: string;
    noticeText?: string;
    error?: YTError;
}

export const initialState: CellPreviewState = {
    visible: false,
    loading: false,
    data: undefined,
};

export default function cellPreviewReducer(
    state = initialState,
    action: CellPreviewAction,
): CellPreviewState {
    switch (action.type) {
        case CELL_PREVIEW.REQUEST: {
            return {
                ...state,
                ytCliDownloadCommand: action.data.ytCliDownloadCommand,
                loading: true,
                error: undefined,
            };
        }
        case CELL_PREVIEW.SUCCESS: {
            return {
                ...state,
                data: action.data.data,
                noticeText: action.data.noticeText,
                loading: false,
            };
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
    | ActionD<typeof CELL_PREVIEW.REQUEST, Pick<CellPreviewState, 'ytCliDownloadCommand'>>
    | ActionD<typeof CELL_PREVIEW.SUCCESS, Pick<CellPreviewState, 'data' | 'noticeText'>>
    | ActionD<typeof CELL_PREVIEW.FAILURE, Pick<CellPreviewState, 'error'>>
    | ActionD<typeof CELL_PREVIEW.PARTITION, Partial<CellPreviewState>>;

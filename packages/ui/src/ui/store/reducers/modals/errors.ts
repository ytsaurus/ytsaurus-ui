import {AxiosError} from 'axios';
import {HIDE_ERROR_MODAL, SHOW_ERROR_MODAL} from '../../../constants/modals/errors';
import {ActionD, YTError} from '../../../types';

export interface ErrorsState {
    nextErrorId: number;
    errors: Record<number | string, ErrorInfo>;
}

export interface ErrorInfo {
    error: YTError<{attributes?: object}> | AxiosError;
    hideOopsMsg?: boolean;
    type?: 'error' | 'alert' | 'info';
    helpURL?: string;
    disableLogger?: boolean;
    defaultExpandedCount?: number;
}

const initialState: ErrorsState = {
    errors: {},
    nextErrorId: 0,
};

export default (state = initialState, action: ErrorsAction) => {
    const {errors, nextErrorId} = state;
    switch (action.type) {
        case SHOW_ERROR_MODAL:
            return {
                ...state,
                errors: {
                    ...errors,
                    [nextErrorId]: action.data,
                },
                nextErrorId: nextErrorId + 1,
            };
        case HIDE_ERROR_MODAL: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {[action.data]: toClose, ...rest} = errors;
            return {
                ...state,
                errors: rest,
            };
        }
        default:
            return state;
    }
};

export type ErrorsAction =
    | ActionD<typeof SHOW_ERROR_MODAL, ErrorInfo>
    | ActionD<typeof HIDE_ERROR_MODAL, number | string>;

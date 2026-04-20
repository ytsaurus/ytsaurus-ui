import {type AxiosError} from 'axios';
import {HIDE_ERROR_MODAL, SHOW_ERROR_MODAL} from '../../../constants/modals/errors';
import {type ErrorInfo, type ErrorsAction} from '../../../store/reducers/modals/errors';
import {type YTError} from '../../../types';

export function showErrorModal<T extends {attributes?: object}>(
    error: YTError<T> | AxiosError,
    options: Omit<ErrorInfo, 'error'> = {},
): ErrorsAction {
    return {type: SHOW_ERROR_MODAL, data: {...options, error}};
}

export function hideErrorModal(errorId: number | string): ErrorsAction {
    return {type: HIDE_ERROR_MODAL, data: errorId};
}

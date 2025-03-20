import {AxiosError} from 'axios';
import {HIDE_ERROR_MODAL, SHOW_ERROR_MODAL} from '../../../constants/modals/errors';
import {ErrorInfo, ErrorsAction} from '../../../store/reducers/modals/errors';
import {YTError} from '../../../types';

export function showErrorModal<T extends {attributes?: object}>(
    error: YTError<T> | AxiosError,
    options: Omit<ErrorInfo, 'error'> = {},
): ErrorsAction {
    return {type: SHOW_ERROR_MODAL, data: {...options, error}};
}

export function hideErrorModal(errorId: number | string): ErrorsAction {
    return {type: HIDE_ERROR_MODAL, data: errorId};
}

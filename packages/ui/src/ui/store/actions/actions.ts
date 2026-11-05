import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../reducers';
import {
    type ActionModalAction,
    type ActionModalData,
    type ActionModalPrompt,
} from '../reducers/actions';

import {CONFIRM_ACTION, DISMISS_ACTION, PROMPT_ACTION} from '../../constants/actions';

import {toaster} from '../../utils/toaster';

export function promptAction(data: ActionModalPrompt): ActionModalAction {
    return {
        type: PROMPT_ACTION,
        data,
    };
}

export function dismissAction(): ActionModalAction {
    return {
        type: DISMISS_ACTION,
    };
}

export function confirmAction(
    handler: ActionModalPrompt['handler'],
    data: ActionModalData,
): ThunkAction<Promise<void>, RootState, null, ActionModalAction> {
    return (dispatch, getState) => {
        dispatch({
            type: CONFIRM_ACTION.REQUEST,
        });

        return handler(data).then(
            () => {
                const {successMessage} = getState().actions;

                dispatch(dismissAction());
                toaster.add({
                    name: 'confirm action',
                    theme: 'success',
                    title: successMessage,
                });
            },
            (error: unknown) => {
                dispatch({
                    type: CONFIRM_ACTION.FAILURE,
                    data: error,
                });
            },
        );
    };
}

export function showErrorModal(error: unknown): ActionModalAction {
    return {
        type: CONFIRM_ACTION.FAILURE,
        data: error,
    };
}

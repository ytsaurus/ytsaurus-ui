import {Toaster} from '@gravity-ui/uikit';
import {CONFIRM_ACTION, DISMISS_ACTION, PROMPT_ACTION} from '../../constants/actions';

const toaster = new Toaster();

export function promptAction(data) {
    const {
        handler,
        successMessage,
        errorMessage,
        optionMessage,
        optionValue,
        optionType,
        options,
        message,
        details,
        successMessageTemplate,
        modalKey,
        confirmationText,
    } = data;

    return {
        type: PROMPT_ACTION,
        data: {
            handler,
            successMessage,
            errorMessage,
            optionMessage,
            optionValue,
            optionType,
            options,
            message,
            details,
            successMessageTemplate,
            modalKey,
            confirmationText,
        },
    };
}

export function dismissAction() {
    return {
        type: DISMISS_ACTION,
    };
}

export function confirmAction(handler, data) {
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
                    timeout: 10000,
                    type: 'success',
                    title: successMessage,
                });
            },
            (error) => {
                dispatch({
                    type: CONFIRM_ACTION.FAILURE,
                    data: error,
                });
            },
        );
    };
}

export function showErrorModal(error) {
    return {
        type: CONFIRM_ACTION.FAILURE,
        data: error,
    };
}

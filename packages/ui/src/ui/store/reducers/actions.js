import {PROMPT_ACTION, CONFIRM_ACTION, DISMISS_ACTION, MODAL_STATES} from '../../constants/actions';

const initialState = {
    status: MODAL_STATES.HIDDEN,
    handler: () => {},
    options: [],
    message: '',
    details: '',
    optionMessage: '',
    optionValue: '',
    optionType: 'radio',
    successMessage: '',
    errorMessage: '',
    error: {},
    confirmationText: '',
    key: undefined,
};

function applyIfFunction(template, defaultValue, ...args) {
    return typeof template === 'function' ? template(...args) : defaultValue;
}

export default (state = initialState, action) => {
    switch (action.type) {
        case PROMPT_ACTION: {
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
            } = action.data;

            return {
                status: MODAL_STATES.PROMPT,
                error: {},
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
            };
        }

        case DISMISS_ACTION:
            return {
                ...state,
                status: MODAL_STATES.HIDDEN,
            };

        case CONFIRM_ACTION.REQUEST:
            return {
                ...state,
                status: MODAL_STATES.PENDING,
            };

        case CONFIRM_ACTION.SUCCESS:
            return {
                ...state,
                status: MODAL_STATES.SUCCEEDED,
                successMessage: applyIfFunction(
                    state.successMessageTemplate,
                    state.successMessage,
                    action.data,
                ),
            };

        case CONFIRM_ACTION.FAILURE:
            return {
                ...state,
                status: MODAL_STATES.FAILED,
                error: action.data,
            };

        default:
            return state;
    }
};

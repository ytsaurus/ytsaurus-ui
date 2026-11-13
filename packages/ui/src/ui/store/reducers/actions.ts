import {type ReactElement} from 'react';
import {type Action} from 'redux';
import {type ActionD} from '../../types';

import {CONFIRM_ACTION, DISMISS_ACTION, MODAL_STATES, PROMPT_ACTION} from '../../constants/actions';

export interface ActionModalData {
    currentOption: string | number | undefined;
}

interface ActionModalPromptBase {
    handler: (data: ActionModalData) => Promise<unknown>;
    modalKey: string;
    message: string | ReactElement;
    successMessage?: string;
    errorMessage?: string | ReactElement;
    details?: string;
    optionMessage?: string;
    options?: Array<{text: string; value: string; data?: {parameters: Record<string, unknown>}}>;
    confirmationText?: string;
}

export type ActionModalOptions =
    {optionType?: 'radio'; optionValue?: string} | {optionType: 'input'; optionValue: number};

export type ActionModalPrompt = ActionModalPromptBase & ActionModalOptions;

export interface ActionModalState extends Omit<ActionModalPromptBase, 'modalKey'> {
    optionType?: ActionModalOptions['optionType'];
    optionValue?: ActionModalOptions['optionValue'];
    modalKey: string | undefined;
    status: (typeof MODAL_STATES)[keyof typeof MODAL_STATES];
    error: unknown;
    key?: undefined;
}

export type ActionModalAction =
    | Action<typeof DISMISS_ACTION | typeof CONFIRM_ACTION.REQUEST>
    | ActionD<typeof PROMPT_ACTION, ActionModalPrompt>
    | ActionD<typeof CONFIRM_ACTION.FAILURE, unknown>;

const initialState: ActionModalState = {
    status: MODAL_STATES.HIDDEN,
    handler: () => Promise.resolve(),
    modalKey: undefined,
    options: [],
    message: '',
    details: '',
    optionMessage: '',
    optionValue: '',
    optionType: 'radio',
    successMessage: '',
    errorMessage: '',
    error: undefined,
    confirmationText: '',
    key: undefined,
};

export default (state = initialState, action: ActionModalAction): ActionModalState => {
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
                modalKey,
                confirmationText,
            } = action.data;

            return {
                status: MODAL_STATES.PROMPT,
                error: undefined,
                handler,
                successMessage,
                errorMessage,
                optionMessage,
                optionValue,
                optionType,
                options,
                message,
                details,
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

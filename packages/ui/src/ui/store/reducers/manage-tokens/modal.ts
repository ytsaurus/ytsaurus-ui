import type {Action} from 'redux';

import {
    MANAGE_TOKENS_MODALS_CLOSE,
    MANAGE_TOKENS_MODALS_OPEN,
} from '../../../constants/manage-tokens';

export type ManageTokensModalState = {
    open: boolean;
};

const initialState: ManageTokensModalState = {
    open: false,
};

export type ManageTokensModalAction =
    | Action<typeof MANAGE_TOKENS_MODALS_CLOSE>
    | Action<typeof MANAGE_TOKENS_MODALS_OPEN>;

function reducer(state = initialState, action: ManageTokensModalAction) {
    switch (action.type) {
        case MANAGE_TOKENS_MODALS_OPEN:
            return {open: true};
        case MANAGE_TOKENS_MODALS_CLOSE:
            return {open: false};
        default:
            return state;
    }
}

export default reducer;

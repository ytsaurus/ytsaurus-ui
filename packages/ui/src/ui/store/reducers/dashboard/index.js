import {CHANGE_ACTIVE_TAB, LinksTab} from '../../../constants/dashboard';

export const initialState = {
    activeTab: LinksTab.LAST_VISITED,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case CHANGE_ACTIVE_TAB:
            return {...state, activeTab: action.data.activeTab};

        default:
            return state;
    }
};

import {CHANGE_ACTIVE_TAB} from '../../../constants/dashboard';

export function changeActiveTab(activeTab) {
    return {
        type: CHANGE_ACTIVE_TAB,
        data: {activeTab},
    };
}

import {
    ToggleQueriesListSidebarAction,
    TOGGLE_QUERIES_LIST_SIDEBAR
} from './actions';

export interface QueryTrackerUiSettingsState {
    showQueriesList: boolean;
}

const initState: QueryTrackerUiSettingsState = {
    showQueriesList: true
};

export function reducer(state = initState, action: Actions): QueryTrackerUiSettingsState {
    switch (action.type) {
        case TOGGLE_QUERIES_LIST_SIDEBAR: {
            return {
                ...state,
                showQueriesList: ! state.showQueriesList
            };
        }
    }

    return state;
}

type Actions = ToggleQueriesListSidebarAction;

import {
    ToggleQueriesListSidebarAction,
    TOGGLE_QUERIES_LIST_SIDEBAR
} from './actions';

const LOCAL_STORAGE_KEY = 'query-tracker/ui-settings/showQueriesList';

export interface QueryTrackerUiSettingsState {
    showQueriesList: boolean;
}

const initState: QueryTrackerUiSettingsState = {
    showQueriesList: (window.localStorage.getItem(LOCAL_STORAGE_KEY) || 'true') === 'true'
};

export function reducer(state = initState, action: Actions): QueryTrackerUiSettingsState {
    switch (action.type) {
        case TOGGLE_QUERIES_LIST_SIDEBAR: {
            const showQueriesList = ! state.showQueriesList;

            window.localStorage.setItem(LOCAL_STORAGE_KEY, String(showQueriesList))

            return {
                ...state,
                showQueriesList
            };
        }
    }

    return state;
}

type Actions = ToggleQueriesListSidebarAction;

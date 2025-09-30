import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {TabsItemProps} from '@gravity-ui/uikit/build/esm/components/Tabs/Tabs';

type Index = number;
export type QueryResultTab =
    | 'error'
    | 'meta'
    | 'statistic'
    | 'progress'
    | `result/${Index}`
    | `chart-tab/${Index}`;

export type QueryTab = TabsItemProps & {id: QueryResultTab};

type QueryResultTabsState = {
    activeTabId: QueryResultTab | undefined;
    tabs: QueryTab[];
    userChangeTab: boolean;
};

export const initialState: QueryResultTabsState = {
    activeTabId: undefined,
    tabs: [],
    userChangeTab: false,
};

export const queryTabsSlice = createSlice({
    name: 'queryTabs',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<QueryResultTab>) => {
            state.activeTabId = action.payload;
        },
        setTabs: (state, action: PayloadAction<QueryTab[]>) => {
            return {
                ...state,
                tabs: [...action.payload],
            };
        },
        setUserChangeTab: (state, action: PayloadAction<boolean>) => {
            state.userChangeTab = action.payload;
        },
        resetQueryTabs: () => {
            return {...initialState};
        },
    },
});

export const {setActiveTab, setTabs, resetQueryTabs, setUserChangeTab} = queryTabsSlice.actions;

export const queryTabsReducer = queryTabsSlice.reducer;

export type ResetQueryTabsAction = ReturnType<typeof resetQueryTabs>;

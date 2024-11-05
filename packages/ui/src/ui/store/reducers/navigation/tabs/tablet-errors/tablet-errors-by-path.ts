import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {YTError} from '../../../../../types';
import {TabletErrorsApi} from '../../../../../../shared/tablet-errors-manager';
import {mergeStateOnClusterChange} from '../../../utils';

export type TabletErrorsByPathState = {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    table_id: string;
    table_path: string;
    data: TabletErrorsApi['tablet_errors_by_table']['response'] | undefined;
    total_row_count?: number | undefined;
    dataParams: Partial<TabletErrorsApi['tablet_errors_by_table']['body']> | undefined;

    timeRangeFilter:
        | {shortcutValue: string; from?: number; to?: number}
        | {from: number; to: number; shortcutValue?: undefined};

    methodsFilter: Array<string>;
    pageFilter: number;
    tabletIdFilter: string;
};

const persistentState: Pick<
    TabletErrorsByPathState,
    'timeRangeFilter' | 'methodsFilter' | 'pageFilter' | 'tabletIdFilter'
> = {
    timeRangeFilter: {shortcutValue: '1d'},
    methodsFilter: [],
    pageFilter: 0,
    tabletIdFilter: '',
};

const ephemeralState: Omit<TabletErrorsByPathState, keyof typeof persistentState> = {
    loading: false,
    loaded: false,
    error: undefined,
    table_id: '',
    table_path: '',
    data: undefined,
    total_row_count: undefined,
    dataParams: undefined,
};

export const initialState: TabletErrorsByPathState = {...persistentState, ...ephemeralState};

const tabletErrorsByPathSlice = createSlice({
    name: 'navigation.tabs.tabletErrorsByPath',
    initialState,
    reducers: {
        onRequest(
            state,
            {payload}: PayloadAction<Pick<TabletErrorsByPathState, 'table_path' | 'table_id'>>,
        ) {
            const {table_path, table_id} = payload;
            if (table_path != state.table_path || table_id !== state.table_id) {
                return {...state, ...payload, data: undefined, loading: true, error: undefined};
            }
            return {...state, loading: true, error: undefined};
        },
        onSuccess(
            state,
            {
                payload,
            }: PayloadAction<
                Pick<TabletErrorsByPathState, 'data' | 'total_row_count' | 'dataParams'>
            >,
        ) {
            return {...state, ...payload, loading: false, loaded: true, error: undefined};
        },
        onError(state, {payload: {error}}: PayloadAction<Pick<TabletErrorsByPathState, 'error'>>) {
            return {...state, error, loading: false};
        },
        updateFilter(state, {payload}: PayloadAction<Partial<typeof persistentState>>) {
            return {...state, ...payload};
        },
    },
});

export const tabletErrorsByPathActions = tabletErrorsByPathSlice.actions;
export const tabletErrorsByPath = mergeStateOnClusterChange(
    ephemeralState,
    persistentState,
    tabletErrorsByPathSlice.reducer,
);

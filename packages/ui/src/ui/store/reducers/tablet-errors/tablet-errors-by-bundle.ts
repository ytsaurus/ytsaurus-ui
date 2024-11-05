import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {YTError} from '../../../types';
import {TabletErrorsApi} from '../../../../shared/tablet-errors-manager';
import {mergeStateOnClusterChange} from '../utils';

export type TabletErrorsByBundleState = {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    bundle: string;
    data: TabletErrorsApi['tablet_errors_by_bundle']['response'] | undefined;
    total_row_count: number | undefined;

    timeRangeFilter:
        | {shortcutValue: string; from?: number; to?: number}
        | {from: number; to: number; shortcutValue?: undefined};

    methodsFilter: Array<string>;
    pageFilter: number;
    tablePathFilter: string;
};

const persistentState: Pick<
    TabletErrorsByBundleState,
    `timeRangeFilter` | 'methodsFilter' | 'pageFilter' | `tablePathFilter`
> = {
    timeRangeFilter: {shortcutValue: '1d'},
    methodsFilter: [],
    pageFilter: 0,
    tablePathFilter: '',
};

const ephemeralState: Omit<TabletErrorsByBundleState, keyof typeof persistentState> = {
    loading: false,
    loaded: false,
    error: undefined,
    bundle: '',
    data: undefined,
    total_row_count: undefined,
};

export const initialState: TabletErrorsByBundleState = {...persistentState, ...ephemeralState};

const tabletErrorsByBundleSlice = createSlice({
    name: 'tabletErrors.tabletErrorsByBundle',
    initialState,
    reducers: {
        onRequest(
            state,
            {payload: {bundle}}: PayloadAction<Pick<TabletErrorsByBundleState, 'bundle'>>,
        ) {
            if (bundle != state.bundle) {
                return {
                    ...state,
                    bundle,
                    data: undefined,
                    total_row_count: undefined,
                    loading: true,
                };
            }
            return {...state, loading: true};
        },
        onSuccess(
            state,
            {
                payload,
            }: PayloadAction<Pick<TabletErrorsByBundleState, 'data'> & {total_row_count?: number}>,
        ) {
            return {...state, ...payload, loading: false, loaded: true, error: undefined};
        },
        onError(
            state,
            {payload: {error}}: PayloadAction<Pick<TabletErrorsByBundleState, 'error'>>,
        ) {
            return {...state, error, loading: false};
        },
        updateFilter(state, {payload}: PayloadAction<Partial<typeof persistentState>>) {
            return {...state, ...payload};
        },
    },
});

export const tabletErrorsByBundleActions = tabletErrorsByBundleSlice.actions;
export const tabletErrorsByBundle = mergeStateOnClusterChange(
    ephemeralState,
    persistentState,
    tabletErrorsByBundleSlice.reducer,
);

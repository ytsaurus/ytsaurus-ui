import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {RootState} from '../../../store/reducers';
import {RoleGroupInfo, SystemNodeCounters} from './proxies';
import {YTError} from '../../../types';
import {mergeStateOnClusterChange} from '../utils';

export interface CypressProxiesState {
    fetching: boolean;
    loaded: boolean;
    error?: YTError;
    roleGroups: Array<RoleGroupInfo>;
    counters: SystemNodeCounters;
}

const initialState: CypressProxiesState = {
    fetching: false,
    loaded: false,
    error: undefined,
    roleGroups: [],
    counters: {total: 0, states: {}, effectiveStates: {}, flags: {}},
};

const cypressProxiesSlice = createSlice({
    name: 'cypressProxies',
    initialState,
    reducers: {
        fetchCypressProxiesRequest: (state) => {
            state.fetching = true;
        },
        fetchCypressProxiesSuccess: (state, action: PayloadAction<{roleGroups: Array<RoleGroupInfo>; counters: SystemNodeCounters}>) => {
            state.fetching = false;
            state.loaded = true;
            state.roleGroups = action.payload.roleGroups;
            state.counters = action.payload.counters;
            state.error = undefined;
        },
        fetchCypressProxiesFailure: (state, action: PayloadAction<YTError | undefined>) => {
            state.fetching = false;
            state.error = action.payload;
        },
    },
    selectors: {
        getCypressProxiesFetching: (state) => state.fetching,
        getCypressProxiesLoaded: (state) => state.loaded,
        getCypressProxiesError: (state) => state.error,
        getCypressProxiesRoleGroups: (state) => state.roleGroups,
        getCypressProxiesCounters: (state) => state.counters,
    },
});

export const {
    fetchCypressProxiesRequest,
    fetchCypressProxiesSuccess,
    fetchCypressProxiesFailure,
} = cypressProxiesSlice.actions;

export const {
    getCypressProxiesFetching, 
    getCypressProxiesLoaded, 
    getCypressProxiesError, 
    getCypressProxiesRoleGroups, 
    getCypressProxiesCounters
} = cypressProxiesSlice.getSelectors((state: RootState) => state.system.cypressProxies);

export default mergeStateOnClusterChange(initialState, {}, cypressProxiesSlice.reducer);

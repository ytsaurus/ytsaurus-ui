import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import zipObject_ from 'lodash/zipObject';
import includes_ from 'lodash/includes';

import {RootState} from '../../../../store/reducers';

type PoolsState = {
    visibleResources: string[]; //('cpu' | 'memory' | 'gpu' | 'operations')[];
};

const initialState: PoolsState = {
    visibleResources: ['cpu', 'memory', 'operations'],
};

const resources = ['cpu', 'memory', 'operations', 'gpu'];

const poolsSlice = createSlice({
    name: 'poolsWidget',
    initialState,
    reducers: {
        updateVisibleResources(
            state,
            {payload}: PayloadAction<Pick<PoolsState, 'visibleResources'>>,
        ) {
            return {...state, visibleResources: payload.visibleResources};
        },
    },
    selectors: {
        selectVisibleResources: (state) => {
            return zipObject_(
                resources,
                resources.map((resource) => includes_(state.visibleResources, resource)),
            );
        },
        selectVisibleResourcesRaw: (state) => state.visibleResources,
    },
});

export const {updateVisibleResources} = poolsSlice.actions;
export const {selectVisibleResources, selectVisibleResourcesRaw} = poolsSlice.getSelectors(
    (state: RootState) => state.dashboard2.poolsWidget,
);

export const poolsWidget = poolsSlice.reducer;

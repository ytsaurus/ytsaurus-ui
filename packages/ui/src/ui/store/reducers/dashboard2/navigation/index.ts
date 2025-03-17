import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {RootState} from '../../../../store/reducers';

type NavigationWidgetState = {
    type: 'last_visited' | 'favourite';
};

const initialState: NavigationWidgetState = {
    type: 'last_visited',
};

export const navigationWidgetSlice = createSlice({
    name: 'navigationWidget',
    initialState,
    reducers: {
        setPathsType(state, {payload}: PayloadAction<NavigationWidgetState>) {
            return {...state, type: payload.type};
        },
    },
    selectors: {
        selectPathsType: (state) => state.type,
    },
});

export const {setPathsType} = navigationWidgetSlice.actions;
export const {selectPathsType} = navigationWidgetSlice.getSelectors(
    (state: RootState) => state.dashboard2.navigationWidget,
);
export const navigationWidget = navigationWidgetSlice.reducer;

import {PayloadAction, createSlice} from '@reduxjs/toolkit';

type NavigationWidgetState = {
    type: 'last_visited' | 'favourite';
};

const initialState: NavigationWidgetState = {
    type: 'last_visited',
};

const navigationWidgetSlice = createSlice({
    name: 'navigationWidget',
    initialState,
    reducers: {
        setPathsType(state, {payload}: PayloadAction<NavigationWidgetState>) {
            return {...state, type: payload.type};
        },
    },
});

export const {setPathsType} = navigationWidgetSlice.actions;
export const navigationWidget = navigationWidgetSlice.reducer;

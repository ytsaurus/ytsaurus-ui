import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {RootState} from '../../../../store/reducers';

type NavigationWidgetState = Record<
    string,
    {
        type: 'last_visited' | 'favourite';
    }
>;

const initialState: NavigationWidgetState = {
    navigation: {
        type: 'last_visited',
    },
};

export const navigationWidgetSlice = createSlice({
    name: 'navigationWidget',
    initialState,
    reducers: {
        setPathsType(
            state,
            {payload}: PayloadAction<{id: string; type: NavigationWidgetState[string]['type']}>,
        ) {
            return {
                ...state,
                [payload.id]: {
                    ...state?.[payload.id],
                    type: payload.type,
                },
            };
        },
    },
    selectors: {
        getPathsType: (state, id: string) => state?.[id]?.type || 'last_visited',
    },
});

export const {setPathsType} = navigationWidgetSlice.actions;
export const {getPathsType} = navigationWidgetSlice.getSelectors(
    (state: RootState) => state.dashboard2.navigationWidget,
);
export const navigationWidget = navigationWidgetSlice.reducer;

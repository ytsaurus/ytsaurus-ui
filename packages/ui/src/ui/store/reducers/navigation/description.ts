import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {RootState} from '..';
import {descriptionApi} from '../../api/navigation/tabs/description';

type DescriptionState = {
    editMode: boolean;
    edittingAnnotation: string | undefined;
    descriptionType: 'yt' | 'external';
};

const initialState: DescriptionState = {
    editMode: false,
    edittingAnnotation: undefined,
    descriptionType: 'yt',
};

const descriptionSlice = createSlice({
    name: 'description',
    initialState,
    reducers: {
        toggleEditMode: (state) => {
            state.editMode = !state.editMode;
        },
        setEdittingAnnotation: (
            state,
            {payload}: PayloadAction<Pick<DescriptionState, 'edittingAnnotation'>>,
        ) => {
            state.edittingAnnotation = payload.edittingAnnotation;
        },
        setDescriptionType: (
            state,
            {payload}: PayloadAction<Pick<DescriptionState, 'descriptionType'>>,
        ) => {
            state.descriptionType = payload.descriptionType;
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            descriptionApi.endpoints.annotation.matchFulfilled,
            (state, {payload}) => {
                state.edittingAnnotation = payload;
            },
        );
    },
    selectors: {
        getEditMode: (state) => state.editMode,
        getDescriptionType: (state) => state.descriptionType,
        getEdittingAnnotation: (state) => state.edittingAnnotation,
    },
});

export const {getEditMode, getDescriptionType, getEdittingAnnotation} =
    descriptionSlice.getSelectors((state: RootState) => state.navigation.description);
export const {toggleEditMode, setEdittingAnnotation, setDescriptionType} = descriptionSlice.actions;
export const description = descriptionSlice.reducer;

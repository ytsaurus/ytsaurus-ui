import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import type {RootState} from '..';
import {type GetAnnotationResponse, descriptionApi} from '../../api/navigation/tabs/description';
import type {ExternalAnnotationResponse} from '../../../UIFactory';

type DescriptionState = {
    editMode: boolean;
    edittingAnnotation: string | undefined;
    modifiedByUser: boolean;
    descriptionType: 'yt' | 'external';
    isSaving: boolean;

    annotation: Partial<GetAnnotationResponse>;
    externalDescription: ExternalAnnotationResponse;
};

const initialState: DescriptionState = {
    editMode: false,
    edittingAnnotation: undefined,
    modifiedByUser: false,
    descriptionType: 'yt',
    isSaving: false,

    annotation: {},
    externalDescription: {},
};

const descriptionSlice = createSlice({
    name: 'description',
    initialState,
    reducers: {
        toggleEditMode: (state) => {
            state.editMode = !state.editMode;
            if (state.editMode) {
                state.edittingAnnotation =
                    state.descriptionType === 'yt'
                        ? (state.annotation.annotation ?? '')
                        : state.externalDescription.externalAnnotation;
            }
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
        setSaving: (state, {payload}: PayloadAction<Pick<DescriptionState, 'isSaving'>>) => {
            state.isSaving = payload.isSaving;
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            descriptionApi.endpoints.annotation.matchFulfilled,
            (state, {payload}) => {
                state.annotation = payload;
            },
        );
        builder.addMatcher(
            descriptionApi.endpoints.externalDescription.matchFulfilled,
            (state, {payload}) => {
                state.externalDescription = payload ?? {};
            },
        );
    },
    selectors: {
        getEditMode: (state) => state.editMode,
        getDescriptionType: (state) => state.descriptionType,
        getEdittingAnnotation: (state) => state.edittingAnnotation,
        getIsSaving: (state) => state.isSaving,
    },
});

export const {getEditMode, getDescriptionType, getEdittingAnnotation, getIsSaving} =
    descriptionSlice.getSelectors((state: RootState) => state.navigation.description);
export const {toggleEditMode, setEdittingAnnotation, setDescriptionType, setSaving} =
    descriptionSlice.actions;
export const description = descriptionSlice.reducer;

import {type PayloadAction, createSlice} from '@reduxjs/toolkit';

import {type RootState} from '..';
import {type GetAnnotationResponse} from '../../api/navigation/tabs/description';
import {type ExternalAnnotationResponse} from '../../../UIFactory';

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
        startEdit: (
            state,
            {
                payload,
            }: PayloadAction<Partial<Pick<DescriptionState, 'annotation' | 'externalDescription'>>>,
        ) => {
            state.editMode = true;
            state.annotation = payload.annotation ?? {};
            state.externalDescription = payload.externalDescription ?? {};
            if (state.descriptionType === 'yt') {
                state.edittingAnnotation = state.annotation.annotation;
            } else {
                state.edittingAnnotation = state.externalDescription.externalAnnotation;
            }
        },
        stopEdit: (state) => {
            state.editMode = false;
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
    selectors: {
        getEditMode: (state) => state.editMode,
        getDescriptionType: (state) => state.descriptionType,
        getEdittingAnnotation: (state) => state.edittingAnnotation,
        getIsSaving: (state) => state.isSaving,
    },
});

export const {getEditMode, getDescriptionType, getEdittingAnnotation, getIsSaving} =
    descriptionSlice.getSelectors((state: RootState) => state.navigation.description);
export const {startEdit, stopEdit, setEdittingAnnotation, setDescriptionType, setSaving} =
    descriptionSlice.actions;
export const description = descriptionSlice.reducer;

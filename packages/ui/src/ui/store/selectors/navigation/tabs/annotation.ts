import {RootState} from '../../../reducers';

export const getNavigationAnnotation = (state: RootState) =>
    state.navigation.tabs.annotation.annotation;
export const getNavigationAnnotationSaving = (state: RootState) =>
    state.navigation.tabs.annotation.saving;
export const getNavigationAnnotationEditing = (state: RootState) =>
    state.navigation.tabs.annotation.editing;

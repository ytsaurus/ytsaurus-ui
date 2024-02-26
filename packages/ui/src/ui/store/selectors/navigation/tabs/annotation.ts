import {RootState} from '../../../reducers';

export const getNavigationAnnotationError = (state: RootState) =>
    state.navigation.tabs.annotation.error;

export const getNavigationAnnotation = (state: RootState) =>
    state.navigation.tabs.annotation.annotation;
export const getNavigationAnnotationPath = (state: RootState) =>
    state.navigation.tabs.annotation.path;
export const getNavigationAnnotationSaving = (state: RootState) =>
    state.navigation.tabs.annotation.saving;
export const getNavigationAnnotationEditing = (state: RootState) =>
    state.navigation.tabs.annotation.editing;

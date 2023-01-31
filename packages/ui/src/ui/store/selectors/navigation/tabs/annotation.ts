import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {calculateLoadingStatus} from '../../../../utils/utils';

const getAnnotationLoading = (state: RootState) => state.navigation.tabs.annotation.loading;
const getAnnotationLoaded = (state: RootState) => state.navigation.tabs.annotation.loaded;
export const getNavigationAnnotationError = (state: RootState) =>
    state.navigation.tabs.annotation.error;

export const getAnnotationLoadStatus = createSelector(
    [getAnnotationLoading, getAnnotationLoaded, getNavigationAnnotationError],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);

export const getNavigationAnnotation = (state: RootState) =>
    state.navigation.tabs.annotation.annotation;
export const getNavigationAnnotationPath = (state: RootState) =>
    state.navigation.tabs.annotation.path;

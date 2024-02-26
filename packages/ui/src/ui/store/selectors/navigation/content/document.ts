import {createSelector} from 'reselect';
import {RootState} from '../../../reducers';
import {calculateLoadingStatus} from '../../../../utils/utils';

export const getNavigationDocumentLoadingStatus = createSelector(
    [
        (store: RootState) => store.navigation.content.document.loading,
        (store: RootState) => store.navigation.content.document.loaded,
        (store: RootState) => store.navigation.content.document.error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);

export const selectNavigationDocument = (store: RootState) => store.navigation.content.document;

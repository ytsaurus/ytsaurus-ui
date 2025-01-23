import {RootState} from '../../../reducers';

export const getAttributesTab = (state: RootState) => state.navigation.tabs.attributes.attributes;

export const getAttributesLoadingInfo = (state: RootState) => ({
    loading: state.navigation.tabs.attributes.loading,
    loaded: state.navigation.tabs.attributes.loaded,
    error: state.navigation.tabs.attributes.error,
});

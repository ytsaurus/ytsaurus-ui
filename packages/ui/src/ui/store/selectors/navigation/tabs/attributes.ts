import {type RootState} from '../../../reducers';

export const selectAttributesTab = (state: RootState) =>
    state.navigation.tabs.attributes.attributes;

export const selectAttributesLoadingInfo = (state: RootState) => ({
    loading: state.navigation.tabs.attributes.loading,
    loaded: state.navigation.tabs.attributes.loaded,
    error: state.navigation.tabs.attributes.error,
});

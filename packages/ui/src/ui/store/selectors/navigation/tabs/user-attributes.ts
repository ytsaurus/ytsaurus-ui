import {type RootState} from '../../../../store/reducers';

export const selectUserAttributes = (state: RootState) =>
    state.navigation.tabs.userAttributes.attributes;
export const selectUserAttributesLoadInfo = (state: RootState) => ({
    loading: state.navigation.tabs.userAttributes.loading,
    loaded: state.navigation.tabs.userAttributes.loaded,
    error: state.navigation.tabs.userAttributes.error,
});

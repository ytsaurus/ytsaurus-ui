import {RootState} from '../../../../store/reducers';

export const getUserAttributes = (state: RootState) =>
    state.navigation.tabs.userAttributes.attributes;
export const getUserAttributesLoadInfo = (state: RootState) => ({
    loading: state.navigation.tabs.userAttributes.loading,
    loaded: state.navigation.tabs.userAttributes.loaded,
    error: state.navigation.tabs.userAttributes.error,
});

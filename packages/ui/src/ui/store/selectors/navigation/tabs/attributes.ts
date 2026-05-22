import {createSelector} from 'reselect';
import {type RootState} from '../../../reducers';
import {
    type LoadableAttributesRequestsState,
    type RequestState,
} from '../../../reducers/navigation/tabs/attributes';

export const selectAttributesTab = (state: RootState) =>
    state.navigation.tabs.attributes.attributes;

const selectOpaqueAttributeKeys = (state: RootState): string[] => {
    return state.navigation.tabs.attributes.opaqueAttributeKeys;
};

export const selectOpaqueAttributeKeysSet = createSelector(
    [selectOpaqueAttributeKeys],
    (opaqueAttributeKeys): Set<string> => {
        return new Set(opaqueAttributeKeys);
    },
);

export const selectAttributesRequestState = (state: RootState): RequestState => {
    return state.navigation.tabs.attributes.attributesRequestState;
};

export const selectLoadableAttributesRequestsState = (
    state: RootState,
): LoadableAttributesRequestsState => {
    return state.navigation.tabs.attributes.loadableAttributesRequestsState;
};

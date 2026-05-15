import isEmpty_ from 'lodash/isEmpty';

import {createSelector} from 'reselect';
import {type RootState} from '../../../../store/reducers';

export const selectNavigationTableMountConfig = (state: RootState) =>
    state.navigation.content.tableMountConfig;

const selectTableMountConfigData = (state: RootState) =>
    state.navigation.content.tableMountConfig.data || {};

const selectTableMountConfigError = (state: RootState) =>
    state.navigation.content.tableMountConfig.error;

export const selectTableMountConfigHasData = createSelector(
    [selectTableMountConfigData, selectTableMountConfigError],
    (data, error) => {
        return !isEmpty_(data) || !isEmpty_(error);
    },
);

import isEmpty_ from 'lodash/isEmpty';

import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';

export const getNavigationTableMountConfig = (state: RootState) =>
    state.navigation.content.tableMountConfig;

const getTableMountConfigData = (state: RootState) =>
    state.navigation.content.tableMountConfig.data || {};

const getTableMountConfigError = (state: RootState) =>
    state.navigation.content.tableMountConfig.error;

export const getTableMountConfigHasData = createSelector(
    [getTableMountConfigData, getTableMountConfigError],
    (data, error) => {
        return !isEmpty_(data) || !isEmpty_(error);
    },
);

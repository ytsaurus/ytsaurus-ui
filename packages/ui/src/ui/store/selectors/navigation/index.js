import {createSelector} from 'reselect';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import {NAVIGATION_MAP_NODE_TABLE_ID} from '../../../constants/navigation/index';
import {getNavigationDefaultPath} from '../../../store/selectors/settings';
import {isFinalLoadingStatus} from '../../../utils/utils';

export const getTransaction = (state) => state.navigation.navigation.transaction;
export const getAttributes = (state) => state.navigation.navigation.attributes;
export const getAttributesWithTypes = (state) => state.navigation.navigation.attributesWithTypes;
export const getLoadState = (state) => state.navigation.navigation.loadState;
export const getError = (state) => state.navigation.navigation.error;
export const getRawPath = (state) => state.navigation.navigation.path;
export const getIdmSupport = (state) => state.navigation.navigation.isIdmSupported;
export const getSortState = (state) => state.tables[NAVIGATION_MAP_NODE_TABLE_ID];

export const getType = createSelector(getAttributes, (attributes) => attributes?.type);

export const getPath = createSelector(
    [getRawPath, getNavigationDefaultPath],
    (rawPath, defaultPath) => rawPath || defaultPath,
);

export const getAttributesPath = createSelector([getAttributes, getPath], (attributes, navigationPath) => attributes?.path || navigationPath);

export const isNavigationFinalLoadState = createSelector([getLoadState], (state) => {
    return isFinalLoadingStatus(state);
});

export const getParsedPath = createSelector(getPath, (path) => {
    try {
        return ypath.YPath.create(path, 'absolute');
    } catch (ex) {
        console.error(ex);
    }
});
export const getActualPath = createSelector([getPath, getType], (path, type) => {
    return type === 'map_node' ? path + '/' : path;
});

export const checkIsTrash = createSelector(
    [getPath],
    (path) => path.startsWith('//tmp/trash') || path.startsWith('//trash'),
);

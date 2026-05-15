import {createSelector} from 'reselect';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import {NAVIGATION_MAP_NODE_TABLE_ID} from '../../../constants/navigation/index';
import {getNavigationDefaultPath} from '../../../store/selectors/settings';
import {isFinalLoadingStatus} from '../../../utils/utils';

export const selectTransaction = (state) => state.navigation.navigation.transaction;
export const selectAttributes = (state) => state.navigation.navigation.attributes;
export const selectAttributesWithTypes = (state) => state.navigation.navigation.attributesWithTypes;
export const selectLoadState = (state) => state.navigation.navigation.loadState;
export const selectError = (state) => state.navigation.navigation.error;
export const selectRawPath = (state) => state.navigation.navigation.path;
export const selectIdmSupport = (state) => state.navigation.navigation.isIdmSupported;
export const selectSortState = (state) => state.tables[NAVIGATION_MAP_NODE_TABLE_ID];

export const selectType = createSelector(selectAttributes, (attributes) => attributes?.type);

export const selectPath = createSelector(
    [selectRawPath, getNavigationDefaultPath],
    (rawPath, defaultPath) => rawPath || defaultPath,
);

export const selectAttributesPath = createSelector(
    [selectAttributes, selectPath],
    (attributes, navigationPath) => attributes?.path || navigationPath,
);

export const selectIsNavigationFinalLoadState = createSelector([selectLoadState], (state) => {
    return isFinalLoadingStatus(state);
});

export const selectParsedPath = createSelector(selectPath, (path) => {
    try {
        return ypath.YPath.create(path, 'absolute');
    } catch (ex) {
        // eslint-disable-next-line no-console
        console.error(ex);
    }
});
export const selectActualPath = createSelector([selectPath, selectType], (path, type) => {
    return type === 'map_node' ? path + '/' : path;
});

export const selectIsTrashPath = createSelector(
    [selectPath],
    (path) => path.startsWith('//tmp/trash') || path.startsWith('//trash'),
);

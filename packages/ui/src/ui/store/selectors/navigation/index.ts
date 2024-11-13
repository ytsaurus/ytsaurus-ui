import {createSelector} from 'reselect';
// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import {NAVIGATION_MAP_NODE_TABLE_ID} from '../../../constants/navigation/index';
import {getNavigationDefaultPath} from '../settings';
import {isFinalLoadingStatus} from '../../../utils/utils';
import {ParsedPath} from '../../../utils/navigation';
import {RootState} from '../../../store/reducers';

export const getTransaction = (state: RootState): undefined | string =>
    state.navigation.navigation.transaction ?? undefined;
export const getAttributes = (state: RootState): Record<string, unknown> =>
    state.navigation.navigation.attributes;
export const getAttributesWithTypes = (state: RootState) =>
    state.navigation.navigation.attributesWithTypes;
export const getLoadState = (state: RootState) => state.navigation.navigation.loadState;
export const getError = (state: RootState) => state.navigation.navigation.error;
export const getRawPath = (state: RootState) => state.navigation.navigation.path;
export const getIdmSupport = (state: RootState) => state.navigation.navigation.isIdmSupported;
export const getSortState = (state: RootState) => state.tables[NAVIGATION_MAP_NODE_TABLE_ID];

export const getType = createSelector(
    getAttributes,
    (attributes?: Record<string, unknown>) => attributes?.type as string | undefined,
);

export const getPath = createSelector(
    [getRawPath, getNavigationDefaultPath],
    (rawPath, defaultPath): string => rawPath || defaultPath,
);

export const getAttributesPath = createSelector(
    [getAttributes, getPath],
    (attributes: Record<string, unknown>, navigationPath: string) =>
        (attributes?.path || navigationPath) as string,
);

export const isNavigationFinalLoadState = createSelector([getLoadState], (state: string) => {
    return isFinalLoadingStatus(state);
});

export const getParsedPath = createSelector(getPath, (path: string) => {
    try {
        return ypath.YPath.create(path, 'absolute') as ParsedPath;
    } catch (ex) {
        console.error(ex);
        return undefined;
    }
});
export const getActualPath = createSelector([getPath, getType], (path, type): string => {
    return type === 'map_node' ? path + '/' : path;
});

export const checkIsTrash = createSelector(
    [getPath],
    (path): boolean => path.startsWith('//tmp/trash') || path.startsWith('//trash'),
);

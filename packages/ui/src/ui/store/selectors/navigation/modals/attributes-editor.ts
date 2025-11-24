import forEach_ from 'lodash/forEach';

import {RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
import ypath from '../../../../common/thor/ypath';

export const getNavigationAttributesData = (state: RootState) =>
    state.navigation.modals.attributesEditor;
export const getNavigationAttributesEditorAttributes = (state: RootState) =>
    state.navigation.modals.attributesEditor.attributesMap;
export const getNavigationAttributesEditorPath = (state: RootState) =>
    state.navigation.modals.attributesEditor.paths;
export const getNavigationAttributesEditorLoading = (state: RootState) =>
    state.navigation.modals.attributesEditor.loading;
export const getNavigationAttributesEditorLoaded = (state: RootState) =>
    state.navigation.modals.attributesEditor.loaded;
export const getNavigationAttributesEditorError = (state: RootState) =>
    state.navigation.modals.attributesEditor.error;
export const getNavigationAttributesEditorVisible = (state: RootState) =>
    state.navigation.modals.attributesEditor.visible;

const getNavigationAttributesEidtorNodesByTypes = createSelector(
    [getNavigationAttributesEditorAttributes],
    (attrsMap) => {
        const staticTables: Array<string> = [];
        const mapNodes: Array<string> = [];
        const dynamicTables: Array<string> = [];

        forEach_(attrsMap, (attrs, path) => {
            const type = ypath.getValue(attrs || {}, '/@type');
            if (type === 'map_node') {
                mapNodes.push(path);
            } else if (['table', 'replicated_table'].includes(type)) {
                if (ypath.getValue(attrs, '/@dynamic')) {
                    dynamicTables.push(path);
                } else {
                    staticTables.push(path);
                }
            }
        });
        return {staticTables, dynamicTables, mapNodes};
    },
);

export const getNavigationAttributesEditorStaticTables = createSelector(
    [getNavigationAttributesEidtorNodesByTypes],
    ({staticTables}) => {
        return staticTables;
    },
);

export const getNavigationAttributesEditorDynamicTables = createSelector(
    [getNavigationAttributesEidtorNodesByTypes],
    ({dynamicTables}) => {
        return dynamicTables;
    },
);

export const getNavigationAttributesEditorMapNodes = createSelector(
    [getNavigationAttributesEidtorNodesByTypes],
    ({mapNodes}) => {
        return mapNodes;
    },
);

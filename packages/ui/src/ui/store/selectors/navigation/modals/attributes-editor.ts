import forEach_ from 'lodash/forEach';

import {type RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
import ypath from '../../../../common/thor/ypath';

export const selectNavigationAttributesData = (state: RootState) =>
    state.navigation.modals.attributesEditor;
export const selectNavigationAttributesEditorAttributes = (state: RootState) =>
    state.navigation.modals.attributesEditor.attributesMap;
export const selectNavigationAttributesEditorPath = (state: RootState) =>
    state.navigation.modals.attributesEditor.paths;
export const selectNavigationAttributesEditorLoading = (state: RootState) =>
    state.navigation.modals.attributesEditor.loading;
export const selectNavigationAttributesEditorLoaded = (state: RootState) =>
    state.navigation.modals.attributesEditor.loaded;
export const selectNavigationAttributesEditorError = (state: RootState) =>
    state.navigation.modals.attributesEditor.error;
export const selectNavigationAttributesEditorVisible = (state: RootState) =>
    state.navigation.modals.attributesEditor.visible;

const selectNavigationAttributesEidtorNodesByTypes = createSelector(
    [selectNavigationAttributesEditorAttributes],
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

export const selectNavigationAttributesEditorStaticTables = createSelector(
    [selectNavigationAttributesEidtorNodesByTypes],
    ({staticTables}) => {
        return staticTables;
    },
);

export const selectNavigationAttributesEditorDynamicTables = createSelector(
    [selectNavigationAttributesEidtorNodesByTypes],
    ({dynamicTables}) => {
        return dynamicTables;
    },
);

export const selectNavigationAttributesEditorMapNodes = createSelector(
    [selectNavigationAttributesEidtorNodesByTypes],
    ({mapNodes}) => {
        return mapNodes;
    },
);

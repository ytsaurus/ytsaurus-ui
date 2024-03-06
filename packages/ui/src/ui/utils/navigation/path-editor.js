import _ from 'lodash';
import unipika from '../../common/thor/unipika';
import ypath from '../../common/thor/ypath';

import CancelHelper from '../cancel-helper';
import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';

export const pathEditorRequests = new CancelHelper();

function prepareSuggestions(initialPath, parentPath, children) {
    let suggestions = _.map(children, (child) => {
        const prepared = {};

        prepared.parentPath = parentPath;
        prepared.childPath = '/' + unipika.decode(ypath.getValue(child));
        prepared.path = prepared.parentPath + prepared.childPath;
        prepared.type = ypath.getValue(child, '/@type');
        prepared.dynamic = ypath.getValue(child, '/@dynamic');
        prepared.targetPathBroken = ypath.getValue(child, '/@broken');

        return prepared;
    });

    suggestions = _.sortBy(suggestions, 'childPath');

    return suggestions;
}

export function preparePath(currentPath) {
    return ypath.YPath.create(currentPath, 'absolute').toSubpath(-2).stringify();
}

export function loadSuggestions(path, customFilter) {
    const parentPath = preparePath(path);

    return ytApiV3Id
        .list(YTApiId.pathEditorLoadSuggestions, {
            parameters: {path: parentPath, attributes: ['type', 'dynamic']},
            cancellation: pathEditorRequests.saveCancelToken,
        })
        .then(ypath.getValue)
        .then((nodes) => prepareSuggestions(path, parentPath, nodes))
        .then((suggestions) => (customFilter ? customFilter(suggestions) : suggestions));
}

export function filterByCurrentPath(currentPath, suggestions) {
    const path = currentPath.toLowerCase();

    return _.filter(suggestions, (child) => {
        const hasPartOfPath = child.path.startsWith(path);
        const isShowCurrentChild = child.path !== path || child.type === 'map_node';

        return hasPartOfPath && isShowCurrentChild;
    });
}

export function getNextSelectedIndex(suggestion, selectedIndex) {
    if (selectedIndex === -1 || selectedIndex === suggestion.length - 1) {
        return 0;
    }

    return selectedIndex + 1;
}

export function getPrevSelectedIndex(suggestions, selectedIndex) {
    if (selectedIndex === -1 || selectedIndex === 0) {
        return suggestions.length - 1;
    }

    return selectedIndex - 1;
}

export function getCompletedPath(suggestion) {
    return suggestion.type === 'map_node' ? suggestion.path + '/' : suggestion.path;
}

export function getIconNameForType(type, targetPathBroken) {
    const icons = {
        document: 'file-alt',
        string_node: 'file-alt',
        int64_node: 'file-alt',
        uint64_node: 'file-alt',
        double_node: 'file-alt',
        boolean_node: 'file-alt',
        map_node: 'folder',
        scheduler_pool_tree_map: 'folder-tree',
        scheduler_pool: 'tasks',
        tablet_cell: 'th',
        journal: 'book',
        table: 'th',
        table_dynamic: 'dyn-th',
        replicated_table: 'th',
        chaos_replicated_table: 'chaos-replicated-table',
        replication_log_table: 'replication-log-table',
        file: 'file',
        topmost_transaction_map: 'folder',
        transaction_map: 'folder',
        transaction: 'code-branch',
        nested_transaction: 'code-branch',
        link: ypath.getBoolean(targetPathBroken) ? 'unlink' : 'link',
        rootstock: 'link',
        portal_entrance: 'link',
        cell_node: 'circle',
        cell_node_map: 'far circle',
        sys_node: 'cog',
        access_control_object_namespace_map: 'acl-namespace-map',
        access_control_object_namespace: 'acl-namespace',
        access_control_object: 'acl-object',
    };

    const icon = type ? icons[type] || 'not-suported' : 'eye-slash';

    return icon;
}

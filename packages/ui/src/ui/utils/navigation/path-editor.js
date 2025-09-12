import filter_ from 'lodash/filter';
import map_ from 'lodash/map';
import sortBy_ from 'lodash/sortBy';

import unipika from '../../common/thor/unipika';
import ypath from '../../common/thor/ypath';

import CancelHelper from '../cancel-helper';
import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';
import {getClusterConfigByName, getClusterProxy} from '../../store/selectors/global';

export const pathEditorRequests = new CancelHelper();

function prepareSuggestions(initialPath, parentPath, children) {
    let suggestions = map_(children, (child) => {
        const prepared = {};

        prepared.parentPath = parentPath;
        prepared.childPath = '/' + unipika.decode(ypath.getValue(child));
        prepared.path = prepared.parentPath + prepared.childPath;
        prepared.type = ypath.getValue(child, '/@type');
        prepared.dynamic = ypath.getValue(child, '/@dynamic');
        prepared.targetPathBroken = ypath.getValue(child, '/@broken');

        return prepared;
    });

    suggestions = sortBy_(suggestions, 'childPath');

    return suggestions;
}

export function preparePath(currentPath) {
    return ypath.YPath.create(currentPath, 'absolute').toSubpath(-2).stringify();
}

export function loadSuggestions({path, customFilter, cluster}) {
    const parentPath = preparePath(path);

    const apiSetup = {
        parameters: {path: parentPath, attributes: ['type', 'dynamic']},
        cancellation: pathEditorRequests.saveCancelToken,
    };

    if (cluster) {
        const clusterConfig = getClusterConfigByName(cluster);
        if (clusterConfig) {
            apiSetup.setup = {
                proxy: getClusterProxy(clusterConfig),
            };
        }
    }

    return ytApiV3Id
        .list(YTApiId.pathEditorLoadSuggestions, apiSetup)
        .then(ypath.getValue)
        .then((nodes) => prepareSuggestions(path, parentPath, nodes))
        .then((suggestions) => (customFilter ? customFilter(suggestions) : suggestions));
}

export function filterByCurrentPath(currentPath, suggestions) {
    const path = currentPath.toLowerCase();

    return filter_(suggestions, (child) => {
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

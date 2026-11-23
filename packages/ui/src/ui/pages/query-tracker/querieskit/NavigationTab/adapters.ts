import type {
    NavigationCluster,
    NavigationItem,
    NavigationItemKind,
    PathEditorSuggestion,
} from '@gravity-ui/querieskit';
import type {ClusterConfig} from '../../../../../shared/yt-types';
import type {PathEditorProps} from '../../../../containers/PathEditor/PathEditor';
import type {NavigationNode} from '@ytsaurus/components';
import {isFolderNode} from '../../../../utils/navigation/isFolderNode';
import {isTableNode} from '../../../../utils/navigation/isTableNode';

export type NavigationTabItem = NavigationItem & {node: NavigationNode};

function getItemKind(type: string | undefined): NavigationItemKind {
    if (type === 'link') {
        return 'link';
    }
    if (isFolderNode(type)) {
        return 'folder';
    }
    if (isTableNode(type)) {
        return 'table';
    }
    return 'unknown';
}

export function toPathSuggestion(
    suggestion: PathEditorProps['suggestions'][number],
): PathEditorSuggestion {
    return {...suggestion, kind: getItemKind(suggestion.type)};
}

export function toNavigationItem(node: NavigationNode): NavigationTabItem {
    const hasChildren = isFolderNode(node.type);
    const isTable = isTableNode(node.type);

    return {
        node,
        path: node.path,
        title: node.name,
        kind: getItemKind(node.type),
        hasChildren,
        disabled: !hasChildren && !isTable,
        targetPathBroken: node.broken,
    };
}

export function toNavigationCluster(
    cluster: Pick<ClusterConfig, 'id' | 'name' | 'environment'>,
    backgroundColor: string,
): NavigationCluster {
    return {
        id: cluster.id,
        title: cluster.name,
        description: cluster.environment,
        backgroundColor,
        color: '#ffffff',
    };
}

// The list uses the same description as the row to calculate its height.
export function getNavigationItemRowConfig({node}: NavigationTabItem) {
    return {
        isFavorite: node.isFavorite,
        description: node.type === 'link' ? node.targetPath : undefined,
    };
}

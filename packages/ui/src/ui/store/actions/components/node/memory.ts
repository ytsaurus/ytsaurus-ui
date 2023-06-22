import type {ThunkAction} from 'redux-thunk';

import {
    NODE_MEMORY_LOAD_FAILURE,
    NODE_MEMORY_LOAD_REQUEST,
    NODE_MEMORY_LOAD_SUCCESS,
    NODE_MEMORY_PARTIAL,
} from '../../../../constants/components/nodes/memory';
import type {RootState} from '../../../../store/reducers';
import type {NodeMemoryLoadAction} from '../../../../store/reducers/components/node/memory';
import type {MemoryUsage} from '../../../../types/node/node';
import {
    getNodeMemoryCollapsedBundles,
    getNodeMemoryStateHost,
} from '../../../../store/selectors/components/node/memory';
import {SortState} from '../../../../types';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';

type NodeMemoryThunkAction = ThunkAction<any, RootState, any, NodeMemoryLoadAction>;

export function loadNodeMemoryUsage(host: string): NodeMemoryThunkAction {
    return (dispatch, getState) => {
        dispatch({type: NODE_MEMORY_LOAD_REQUEST, data: {host}});

        return ytApiV3Id
            .get(YTApiId.nodeMemoryUsage, {
                path: `//sys/cluster_nodes/${host}/orchid/tablet_slot_manager/memory_usage_statistics`,
            })
            .then((memory: MemoryUsage) => {
                const stateHost = getNodeMemoryStateHost(getState());
                if (stateHost !== host) {
                    return;
                }

                dispatch({
                    type: NODE_MEMORY_LOAD_SUCCESS,
                    data: {memory},
                });
            })
            .catch((error: Error) => {
                const stateHost = getNodeMemoryStateHost(getState());
                if (stateHost !== host) {
                    return;
                }

                dispatch({
                    type: NODE_MEMORY_LOAD_FAILURE,
                    data: error,
                });
            });
    };
}

export function setNodeBundlesSort(sortOrder: Array<SortState>): NodeMemoryThunkAction {
    return (dispatch) => {
        dispatch({
            type: NODE_MEMORY_PARTIAL,
            data: {sortOrder},
        });
    };
}

export function toggleNodeMemoryBundleExpanded(name: string): NodeMemoryThunkAction {
    return (dispatch, getState) => {
        const collapsedBundles = [...getNodeMemoryCollapsedBundles(getState())];
        const index = collapsedBundles.indexOf(name);
        if (index === -1) {
            collapsedBundles.push(name);
        } else {
            collapsedBundles.splice(index, 1);
        }
        dispatch({
            type: NODE_MEMORY_PARTIAL,
            data: {collapsedBundles},
        });
    };
}

export function setNodeMemoryTablesSort(tablesSortOrder: Array<SortState>): NodeMemoryThunkAction {
    return (dispatch) => {
        dispatch({
            type: NODE_MEMORY_PARTIAL,
            data: {tablesSortOrder},
        });
    };
}

export function setNodeMemoryFilters(data: {
    viewMode?: 'cells' | 'tables';
    filter?: string;
}): NodeMemoryLoadAction {
    return {
        type: NODE_MEMORY_PARTIAL,
        data,
    };
}

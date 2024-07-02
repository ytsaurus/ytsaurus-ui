import _ from 'lodash';
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {Toaster} from '@gravity-ui/uikit';

import ypath from '../../../../common/thor/ypath';
import {prepareRequest, saveRequestCancellation} from '../../../../utils/navigation';
import {
    APPLY_CUSTOM_SORT,
    FETCH_NODES,
    NAVIGATION_MAP_NODE_TABLE_ID,
    SELECT_ALL,
    SET_CONTENT_MODE,
    SET_MEDIUM_TYPE,
    SET_SELECTED_ITEM,
    SET_TEXT_FILTER,
    UPDATE_RESOURCE_USAGE,
} from '../../../../constants/navigation';
import {
    getFilteredNodes,
    getLastSelected,
    getNodesData,
    getSelected,
    getSortedNodes,
    isRootNode,
    shouldApplyCustomSort,
} from '../../../../store/selectors/navigation/content/map-node';
import {getCluster} from '../../../../store/selectors/global';
import {getPath, getTransaction} from '../../../../store/selectors/navigation';
import {changeColumnSortOrder} from '../../../../store/actions/tables';
import {RumWrapper, YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {getBatchError, showErrorPopup} from '../../../../utils/utils';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import hammer from '../../../../common/hammer';
import {GENERIC_ERROR_MESSAGE} from '../../../../constants';
import {isSupportedEffectiveExpiration} from '../../../../store/selectors/thor/support';
import {waitForFontFamilies} from '../../../../store/actions/global/fonts';

function getList(path, transaction, cluster, allowEffectiveExpiration) {
    const id = new RumWrapper(cluster, RumMeasureTypes.NAVIGATION_CONTENT_MAP_NODE);
    return id.fetch(
        YTApiId.navigationListNodes,
        ytApiV3Id.list(
            YTApiId.navigationListNodes,
            prepareRequest({
                attributes: [
                    'type',
                    'dynamic',
                    'row_count', // Deprecated
                    'unmerged_row_count', // Deprecated
                    'chunk_row_count',
                    'modification_time',
                    'creation_time',
                    'resource_usage',
                    'data_weight',
                    'account',
                    'target_path',
                    'broken',
                    'lock_count',
                    'tablet_state',
                    '_restore_path',
                    'expiration_time',
                    'expiration_timeout',
                    ...(allowEffectiveExpiration ? ['effective_expiration'] : []),
                ],
                path,
                transaction,
            }),
            saveRequestCancellation,
        ),
    );
}

export function fetchNodes() {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);
        const cluster = getCluster(state);

        const allowEffectiveExpiration = isSupportedEffectiveExpiration(state);

        dispatch({type: FETCH_NODES.REQUEST});
        return dispatch(
            waitForFontFamilies(getList(path, transaction, cluster, allowEffectiveExpiration)),
        )
            .then(ypath.getValue)
            .then((data) => {
                dispatch({
                    type: FETCH_NODES.SUCCESS,
                    data,
                });

                const applyCustomSort = shouldApplyCustomSort(getState());
                dispatch({
                    type: APPLY_CUSTOM_SORT,
                    data: applyCustomSort ? 'date' : '',
                });
                if (applyCustomSort) {
                    dispatch(
                        changeColumnSortOrder({
                            tableId: NAVIGATION_MAP_NODE_TABLE_ID,
                            columnName: 'name',
                            asc: false,
                        }),
                    );
                }
            })
            .catch((error) => {
                if (error.code !== yt.codes.CANCELLED) {
                    dispatch({
                        type: FETCH_NODES.FAILURE,
                        data: {
                            message: 'Could not load list. ' + GENERIC_ERROR_MESSAGE,
                            details: error,
                        },
                    });
                } else {
                    dispatch({type: FETCH_NODES.CANCELLED});
                }
            });
    };
}

export function updateResourceUsage() {
    const BATCH_LIMIT = 200;

    function updatedNodeData(nodeValue, newData) {
        return newData
            ? {
                  $value: nodeValue.$value,
                  $attributes: {
                      ...nodeValue.$attributes,
                      recursive_resource_usage: newData,
                  },
              }
            : nodeValue;
    }

    return (dispatch, getState) => {
        const state = getState();

        let nodes = getFilteredNodes(state);
        nodes = _.filter(nodes, (node) => !node.$attributes.recursive_resource_usage);

        if (isRootNode(state) || nodes.length === 0) {
            return;
        }

        dispatch({type: UPDATE_RESOURCE_USAGE.REQUEST});

        const nodesChunks = _.chunk(nodes, BATCH_LIMIT);
        const batchedRequests = _.map(nodesChunks, (nodesChunk) => {
            const requests = _.map(nodesChunk, (node) => {
                return {
                    command: 'get',
                    parameters: {
                        path: node.path + '&/@recursive_resource_usage',
                        timeout: 60 * 1000,
                    },
                };
            });

            return ytApiV3Id.executeBatch(YTApiId.navigationResourceUsage, {requests});
        });

        Promise.all(batchedRequests)
            .then((resultChunks) => {
                const dataMap = {};

                const errorResults = [];

                _.forEach(nodes, (node, index) => {
                    const resultChunkIndex = Math.floor(index / BATCH_LIMIT);
                    const resultChunk = resultChunks[resultChunkIndex];
                    const item = resultChunk[index % BATCH_LIMIT];

                    if (item.error) {
                        errorResults.push(item);
                    } else if (item.output) {
                        dataMap[node.$value] = item.output;
                    }
                });

                dispatch({
                    type: UPDATE_RESOURCE_USAGE.SUCCESS,
                    data: _.map(getNodesData(state), (nodeData) =>
                        updatedNodeData(nodeData, dataMap[nodeData.$value]),
                    ),
                });

                const error = getBatchError(errorResults, 'Failed to get resource usage');
                if (error) {
                    throw error;
                }
            })
            .catch((error) => {
                if (error.code !== yt.codes.CANCELLED) {
                    dispatch({
                        type: UPDATE_RESOURCE_USAGE.FAILURE,
                        data: {
                            message: 'Failed to load resources. ' + GENERIC_ERROR_MESSAGE,
                            details: error,
                        },
                    });
                    const toast = new Toaster();
                    toast.add({
                        theme: 'danger',
                        name: 'map_node_update_resources',
                        timeout: 500000,
                        title: 'Resource loading error',
                        content: error ? error.message : hammer.format.NO_VALUE,
                        actions: [
                            {
                                label: ' view',
                                onClick: () => showErrorPopup(error),
                            },
                        ],
                    });
                } else {
                    dispatch({
                        type: UPDATE_RESOURCE_USAGE.CANCELLED,
                    });
                }
            });
    };
}

export function setFilter(filter) {
    return (dispatch, getState) => {
        const path = getPath(getState());

        dispatch({
            type: SET_TEXT_FILTER,
            data: {filter, path},
        });
    };
}

export function setContentMode(contentMode) {
    return {
        type: SET_CONTENT_MODE,
        data: contentMode,
    };
}

export function setMediumType(mediumType) {
    return {
        type: SET_MEDIUM_TYPE,
        data: mediumType,
    };
}

export function setSelectedItem(name, shiftKey) {
    return (dispatch, getState) => {
        const state = getState();
        const selected = {...getSelected(state)};
        if (selected[name] && !shiftKey) {
            delete selected[name];
        } else {
            selected[name] = true;
        }

        const lastSelected = getLastSelected(state);
        if (lastSelected && shiftKey) {
            const nodes = getSortedNodes(state);
            const lastIndex = _.findIndex(nodes, (item) => lastSelected === item.name);
            if (-1 !== lastIndex) {
                const nameIndex = _.findIndex(nodes, (item) => item.name === name);
                if (-1 !== nameIndex && lastIndex !== nameIndex) {
                    const from = Math.min(lastIndex, nameIndex);
                    const to = Math.max(lastIndex, nameIndex);
                    for (let i = from; i <= to; ++i) {
                        const item = nodes[i];
                        selected[item.name] = true;
                    }
                }
            }
        }

        dispatch({
            type: SET_SELECTED_ITEM,
            data: {selected, lastSelected: selected[name] ? name : undefined},
        });
    };
}

export function selectAll(isAllSelected) {
    return (dispatch, getState) => {
        let selected = {};

        if (!isAllSelected) {
            const allNodes = getFilteredNodes(getState());

            selected = _.reduce(
                allNodes,
                (res, node) => {
                    res[ypath.getValue(node)] = true;
                    return res;
                },
                {},
            );
        }

        dispatch({
            type: SELECT_ALL,
            data: {selected},
        });
    };
}

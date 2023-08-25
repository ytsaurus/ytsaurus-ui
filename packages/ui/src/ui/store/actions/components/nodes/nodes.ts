// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import difference_ from 'lodash/difference';
import omit_ from 'lodash/omit';
import forEach_ from 'lodash/forEach';
import compact_ from 'lodash/compact';
import type {ThunkAction} from 'redux-thunk';

import ypath from '../../../../common/thor/ypath';

import {setSetting} from '../../../../store/actions/settings';
import {NAMESPACES, SettingName} from '../../../../../shared/constants/settings';
import {
    getComponentsNodesNodeTypes,
    getRequestIndex,
    getRequiredAttributes,
    useRacksFromAttributes,
    useTagsFromAttributes,
} from '../../../../store/selectors/components/nodes/nodes';
import {getTemplates} from '../../../../store/selectors/settings';
import type {RootState} from '../../../../store/reducers';
import type {DecommissionAction} from '../../../../store/reducers/components/decommission';
import {Node} from '../../../../store/reducers/components/nodes/nodes/node';
import type {
    NodesAction,
    NodesState,
} from '../../../../store/reducers/components/nodes/nodes/nodes';
import type {NodesSetupState} from '../../../../store/reducers/components/nodes/setup/setup';
import {
    APPLY_SETUP,
    CHANGE_CONTENT_MODE,
    CHANGE_HOST_FILTER,
    CHANGE_NODE_TYPE,
    COMPONENTS_NODES_UPDATE_NODE,
    GET_NODES,
    GET_NODES_FILTER_OPTIONS,
} from '../../../../constants/components/nodes/nodes';
import {USE_CACHE, USE_MAX_SIZE} from '../../../../constants';
import CancelHelper from '../../../../utils/cancel-helper';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import type {ActionD, FIX_MY_TYPE, PartialDeep} from '../../../../types';
import {prepareAttributes} from '../../../../utils/cypress-attributes';
import {splitBatchResults, wrapApiPromiseByToaster} from '../../../../utils/utils';
import {NodeType} from '../../../../../shared/constants/system';
import {BatchSubRequest} from '../../../../../shared/yt-types';

const {COMPONENTS} = NAMESPACES;
const {TEMPLATES} = SettingName.COMPONENTS;

export type NodesThunkAction = ThunkAction<
    void,
    RootState,
    never,
    DecommissionAction | NodesAction
>;

export function changeContentMode(
    contentMode: NodesState['contentMode'],
): ActionD<typeof CHANGE_CONTENT_MODE, Pick<NodesState, 'contentMode'>> {
    return {
        type: CHANGE_CONTENT_MODE,
        data: {contentMode},
    };
}

const updateNodeCanceler = new CancelHelper();

export function getNodes(): NodesThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const index = getRequestIndex(state) + 1;
        dispatch({type: GET_NODES.REQUEST, data: {index}});

        const attributes = getRequiredAttributes(getState());
        const preparedAttrs = prepareAttributes(attributes);

        const nodeTypes = getComponentsNodesNodeTypes(state);
        const requests: Array<BatchSubRequest> = nodeTypes.map((type) => {
            return {
                command: 'list',
                parameters: {
                    path: `//sys/${type}`,
                    attributes: preparedAttrs,
                    ...USE_CACHE,
                    ...USE_MAX_SIZE,
                },
            };
        });

        return ytApiV3Id
            .executeBatch(YTApiId.componentsClusterNodes, {
                parameters: {requests},
                cancellation: updateNodeCanceler.removeAllAndSave,
            })
            .then((data) => {
                const {results, error} = splitBatchResults(data);
                dispatch({
                    type: GET_NODES.SUCCESS,
                    data: {
                        index,
                        nodes: [].concat(
                            ...results.map((output) => {
                                return ypath.getValue(output) || [];
                            }),
                        ),
                    },
                });

                if (error) {
                    throw error;
                }
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: GET_NODES.CANCELLED, data: {index}});
                    return;
                }
                dispatch({
                    type: GET_NODES.FAILURE,
                    data: {index, error},
                });
            });
    };
}

export function updateComponentsNode(host: string): NodesThunkAction {
    return (dispatch) => {
        return ytApiV3Id
            .get(YTApiId.componentsUpdateNodeData, {
                path: `//sys/cluster_nodes/${host}`,
                attributes: prepareAttributes(Node.ATTRIBUTES),
            })
            .then((node) => {
                dispatch({
                    type: COMPONENTS_NODES_UPDATE_NODE,
                    data: {node: {...node, $value: host}},
                });
            });
    };
}

export function changeHostFilter(
    hostFilter: string,
): ActionD<typeof CHANGE_HOST_FILTER, Pick<NodesState, 'hostFilter'>> {
    return {
        type: CHANGE_HOST_FILTER,
        data: {hostFilter: hostFilter.trim()},
    };
}

export function componentsNodesSetNodeTypes(nodeTypes: Array<NodeType>): NodesThunkAction {
    return (dispatch) => {
        dispatch({
            type: CHANGE_NODE_TYPE,
            data: {nodeTypes},
        });

        dispatch(getNodes());
    };
}

export function applyPreset(
    setup: PartialDeep<NodesSetupState>,
): ActionD<typeof APPLY_SETUP, PartialDeep<NodesSetupState>> {
    return {
        type: APPLY_SETUP,
        data: setup,
    };
}

export function savePreset(name: string, data: FIX_MY_TYPE): NodesThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const prevTemplates = getTemplates(state) || {};
        const templates = {
            ...prevTemplates,
            [name]: data,
        };

        dispatch(setSetting(TEMPLATES, COMPONENTS, templates));
    };
}

export function removePreset(name: string): NodesThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const templates = omit_(getTemplates(state), name);

        dispatch(setSetting(TEMPLATES, COMPONENTS, templates));
    };
}

export function handleColumnsChange(selectedColumns: string[]): NodesThunkAction {
    return async (dispatch, getState) => {
        const prevAttributes = getRequiredAttributes(getState());

        await dispatch(
            setSetting(
                SettingName.COMPONENTS.SELECTED_COLUMNS,
                NAMESPACES.COMPONENTS,
                selectedColumns,
            ),
        );

        const currentAttributes = getRequiredAttributes(getState());
        if (difference_(currentAttributes, prevAttributes).length > 0) {
            await dispatch(getNodes());
        }
    };
}

export function getComponentsNodesFilterOptions(): NodesThunkAction {
    return (dispatch, getState) => {
        const state = getState();

        const attributes = compact_([
            !useTagsFromAttributes(state) && 'tags',
            !useRacksFromAttributes(state) && 'rack',
        ]);

        if (0 === attributes.length) {
            return;
        }

        dispatch({type: GET_NODES_FILTER_OPTIONS.REQUEST});

        wrapApiPromiseByToaster(
            ytApiV3Id.list(YTApiId.componentsClusterNodes, {
                path: '//sys/cluster_nodes',
                attributes,
                ...USE_CACHE,
                ...USE_MAX_SIZE,
            }),
            {
                toasterName: 'node filter options',
                errorTitle: `Failed to load node ${attributes.join(',')}`,
                skipSuccessToast: true,
            },
        )
            .then((nodes) => {
                const tags = new Set<string>();
                const racks = new Set<string>();
                forEach_(nodes, (item) => {
                    const node = new Node(item);
                    forEach_(node.tags, (tag) => {
                        if (tag) {
                            tags.add(tag);
                        }
                    });
                    if (node.rack) {
                        racks.add(node.rack);
                    }
                });

                dispatch({
                    type: GET_NODES_FILTER_OPTIONS.SUCCESS,
                    data: {
                        filterOptionsTags: [...tags].sort(),
                        filterOptionsRacks: [...racks].sort(),
                    },
                });
            })
            .catch((error) => {
                dispatch({
                    type: GET_NODES_FILTER_OPTIONS.FAILURE,
                    data: {error},
                });
            });
    };
}

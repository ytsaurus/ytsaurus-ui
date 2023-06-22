// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import _ from 'lodash';
import type {ThunkAction} from 'redux-thunk';

import ypath from '../../../../common/thor/ypath';

import {setSetting} from '../../../../store/actions/settings';
import {NAMESPACES, SettingName} from '../../../../../shared/constants/settings';
import {
    getRequestIndex,
    getRequiredAttributes,
    getShouldFetchTags,
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
    GET_NODES_TAGS,
} from '../../../../constants/components/nodes/nodes';
import {USE_CACHE, USE_MAX_SIZE} from '../../../../constants';
import CancelHelper from '../../../../utils/cancel-helper';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import type {ActionD, FIX_MY_TYPE, PartialDeep} from '../../../../types';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {DiscoverVersionsData, VersionHostInfo, getVersions} from '../versions/versions_v2';
import {NodeType} from '../../../../../shared/constants/system';

const {COMPONENTS} = NAMESPACES;
const {TEMPLATES} = SettingName.COMPONENTS;

export type NodesThunkAction = ThunkAction<
    void,
    RootState,
    never,
    DecommissionAction | NodesAction
>;

export function changeContentMode({
    target,
}: {
    target: {value: NodesState['contentMode']};
}): ActionD<typeof CHANGE_CONTENT_MODE, Pick<NodesState, 'contentMode'>> {
    return {
        type: CHANGE_CONTENT_MODE,
        data: {contentMode: target.value},
    };
}

const updateNodeCanceler = new CancelHelper();

export function getNodes(): NodesThunkAction {
    return (dispatch, getState) => {
        const {nodeType} = getState().components.nodes.nodes;
        const index = getRequestIndex(getState()) + 1;
        dispatch({type: GET_NODES.REQUEST, data: {index}});

        updateNodeCanceler.removeAllRequests();

        const attributes = getRequiredAttributes(getState());

        return Promise.all([
            ytApiV3Id.list(YTApiId.componentsClusterNodes, {
                parameters: {
                    path: `//sys/${nodeType}`,
                    attributes: attributes.filter((a) => a !== 'versions'),
                    ...USE_CACHE,
                    ...USE_MAX_SIZE,
                },
                cancellation: updateNodeCanceler.saveCancelToken,
            }),
            attributes.indexOf('versions') < 0
                ? {nodes: {}}
                : dispatch(getVersions()).then((data: DiscoverVersionsData) => {
                      const nodes = _.reduce(
                          data?.details,
                          (acc, item) => {
                              if (item.type === 'node') {
                                  acc[item.address] = item;
                              }
                              return acc;
                          },
                          {} as Record<string, VersionHostInfo>,
                      );
                      return {nodes};
                  }),
        ])
            .then(([nodes, versions]) => {
                dispatch({
                    type: GET_NODES.SUCCESS,
                    data: {
                        index,
                        nodes: ypath.getValue(nodes),
                        versions: versions.nodes,
                    },
                });
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
                attributes: Node.ATTRIBUTES,
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

export function changeNodeType(nodeType: NodeType): NodesThunkAction {
    return (dispatch) => {
        dispatch({
            type: CHANGE_NODE_TYPE,
            data: {nodeType},
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
        const templates = _.omit(getTemplates(state), name);

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
        if (_.difference(currentAttributes, prevAttributes).length > 0) {
            await dispatch(getNodes());
        }
    };
}

export function getTags(): NodesThunkAction {
    return (dispatch, getState) => {
        const shouldFetchTags = getShouldFetchTags(getState());
        if (!shouldFetchTags) {
            return;
        }

        dispatch({type: GET_NODES_TAGS.REQUEST});

        return wrapApiPromiseByToaster(
            ytApiV3Id.list(YTApiId.componentsClusterNodes, {
                path: '//sys/cluster_nodes',
                attributes: ['tags'],
                ...USE_CACHE,
                ...USE_MAX_SIZE,
            }),
            {
                toasterName: 'node tags',
                errorTitle: 'Failed to load node tags',
                skipSuccessToast: true,
            },
        )
            .then((nodes) => {
                dispatch({
                    type: GET_NODES_TAGS.SUCCESS,
                    data: {nodes: ypath.getValue(nodes)},
                });
            })
            .catch((error) => {
                dispatch({
                    type: GET_NODES_TAGS.FAILURE,
                    data: {error},
                });
            });
    };
}

import type {ThunkAction} from 'redux-thunk';
import forEach_ from 'lodash/forEach';

import {RootState} from '../../../store/reducers';
import {
    NODE_MAINTENANCE_PARTIAL,
    NODE_MAINTENANCE_RESET,
} from '../../../constants/components/node-maintenance-modal';
import {
    NodeMaintenanceAction,
    NodeMaintenanceState,
    NodeResourceLimits,
} from '../../../store/reducers/components/node-maintenance-modal';
import {
    isAllowedMaintenanceApiNodes,
    isAllowedMaintenanceApiProxies,
} from '../../../store/selectors/components/node-maintenance-modal';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {YTApiId, ytApiV3Id, ytApiV4Id} from '../../../rum/rum-wrap-api';
import {AddMaintenanceParams, BatchSubRequest} from '../../../../shared/yt-types';
import {updateComponentsNode} from './nodes/nodes';
import {getCurrentUserName} from '../../../store/selectors/global';
import {prepareSetCommandForBatch} from '../../../utils/cypress-attributes';
import {getProxies} from './proxies/proxies';

type NodeMaintenanceThunkAction<T = Promise<unknown>> = ThunkAction<
    T,
    RootState,
    unknown,
    NodeMaintenanceAction
>;

function makeNodePath(address: string, component: AddMaintenanceParams['component']) {
    switch (component) {
        case 'cluster_node':
            return `//sys/cluster_nodes/${address}`;
        case 'http_proxy':
            return `//sys/http_proxies/${address}`;
        case 'rpc_proxy':
            return `//sys/rpc_proxies/${address}`;
        default:
            throw new Error(`Unexpected component type: ${component}`);
    }
}

function makeObsoleteMaintenanceRequests(
    command: 'add_maintenance' | 'remove_maintenance',
    {
        address,
        type,
        comment: c,
        component,
    }: Pick<AddMaintenanceParams, 'address' | 'type' | 'comment' | 'component'>,
): Array<BatchSubRequest> {
    const path = makeNodePath(address, component);
    const isAdd = command === 'add_maintenance';
    const comment = isAdd ? c : '';
    switch (type) {
        case 'ban': {
            const banned = command === 'add_maintenance';
            return [
                {command: 'set', parameters: {path: `${path}/@banned`}, input: banned},
                {command: 'set', parameters: {path: `${path}/@ban_message`}, input: comment},
            ];
        }
        case 'disable_scheduler_jobs':
        case 'disable_tablet_cells':
        case 'disable_write_sessions':
            return [{command: 'set', parameters: {path: `${path}/@${type}`}, input: isAdd}];
        case 'decommission':
            return [
                {command: 'set', parameters: {path: `${path}/@decommissioned`}, input: isAdd},
                {
                    command: 'set',
                    parameters: {path: `${path}/@decommission_message`},
                    input: isAdd ? comment : '',
                },
            ];
        default:
            return [];
    }
}

export function applyMaintenance(
    address: string,
    component: NodeMaintenanceState['component'],
    data: NodeMaintenanceState['maintenance'],
    resourceLimitsOverrides?: Partial<NodeResourceLimits>,
    role?: string,
): NodeMaintenanceThunkAction {
    return (dispatch, getState) => {
        const requests: Array<BatchSubRequest> = [];

        const path = makeNodePath(address, component);

        if (role && (component === 'http_proxy' || component === 'rpc_proxy')) {
            requests.push(prepareSetCommandForBatch(`${path}/@role`, role));
        }

        forEach_(resourceLimitsOverrides, (value, key) => {
            requests.push(
                prepareSetCommandForBatch(
                    `${path}/@resource_limits_overrides/${key}`,
                    isNaN(value!)
                        ? undefined
                        : {$value: value, $type: key === 'cpu' ? 'double' : 'int64'},
                    {
                        input_format: {
                            $value: 'json',
                            $attributes: {annotate_with_types: true},
                        },
                    },
                ),
            );
        });

        forEach_(data, (item, t) => {
            const type = t as AddMaintenanceParams['type'];
            const command = item?.state ? 'add_maintenance' : 'remove_maintenance';
            const comment = item?.comment;

            if (!isMaintenanceApiAllowedForComponent(component, getState())) {
                requests.push(
                    ...makeObsoleteMaintenanceRequests(command, {
                        address,
                        component,
                        comment,
                        type,
                    }),
                );
            } else {
                const parameters = {
                    component,
                    address,
                    type,
                    comment,
                };
                requests.push(
                    command === 'add_maintenance'
                        ? {command, parameters}
                        : {
                              command,
                              parameters: {...parameters, mine: true},
                          },
                );
            }
        });

        const reloadNodeData = () => {
            switch (component) {
                case 'cluster_node':
                    return dispatch(updateComponentsNode(address));
                case 'http_proxy':
                    return dispatch(getProxies('http'));
                case 'rpc_proxy':
                    return dispatch(getProxies('rpc'));
            }
        };

        return wrapApiPromiseByToaster(ytApiV4Id.executeBatch(YTApiId.addMaintenance, {requests}), {
            toasterName: 'edit_node_' + address,
            batchType: 'v4',
            skipSuccessToast: true,
            errorTitle: `Failed to modify ${address}`,
        })
            .then(reloadNodeData)
            .catch(reloadNodeData);
    };
}

export function showNodeMaintenance(
    params: Pick<NodeMaintenanceState, 'address' | 'component'>,
): NodeMaintenanceThunkAction {
    return async (dispatch) => {
        const data = await dispatch(loadNodeMaintenanceData(params));

        return dispatch({
            type: NODE_MAINTENANCE_PARTIAL,
            data: {...params, ...data},
        });
    };
}

export type MaintenanceRequestInfo = {
    user: string;
    comment: string;
    timestamp: string;
    type: AddMaintenanceParams['type'];
};

type MaintenanceDataResponse = {
    banned?: boolean;
    ban?: boolean;
    ban_message?: string;
    decommissioned?: boolean;
    decommission_message?: string;
    disable_scheduler_jobs?: boolean;
    disable_tablet_cells?: boolean;
    disable_write_sessions?: boolean;

    resource_limits?: NodeResourceLimits;
    resource_limits_overrides?: Partial<NodeResourceLimits>;

    maintenance_requests?: Record<string, MaintenanceRequestInfo>;

    role?: string;
};

export function loadNodeMaintenanceData({
    address,
    component,
}: Pick<NodeMaintenanceState, 'address' | 'component'>): NodeMaintenanceThunkAction<
    Promise<{
        maintenance: NodeMaintenanceState['maintenance'];
        resourceLimits?: NodeResourceLimits;
        resourceLimitsOverrides?: Partial<NodeResourceLimits>;
    }>
> {
    return (_dispatch, getState) => {
        const state = getState();
        const user = getCurrentUserName(state);
        const path = makeNodePath(address, component) + '/@';

        const allowMaintenanceRequests = isMaintenanceApiAllowedForComponent(component, state);

        return wrapApiPromiseByToaster(
            ytApiV3Id.get(YTApiId.maintenanceRequests, {
                path,
                attributes: [
                    'resource_limits',
                    'resource_limits_overrides',
                    ...(allowMaintenanceRequests
                        ? ['maintenance_requests']
                        : [
                              'ban_message',
                              'decommissioned',
                              'decommission_message',
                              'disable_scheduler_jobs',
                              'disable_tablet_cells',
                              'disable_write_sessions',
                          ]),
                    ...(component === 'http_proxy' || component === 'rpc_proxy'
                        ? ['banned', 'role']
                        : ['banned']),
                ],
            }),
            {
                toasterName: 'maintenance_attributes_request_' + path,
                skipSuccessToast: true,
                errorContent: `Cannot load node attributes for ${path}`,
            },
        ).then((data: MaintenanceDataResponse) => {
            const maintenance: NodeMaintenanceState['maintenance'] = {};
            if (allowMaintenanceRequests) {
                forEach_(data.maintenance_requests, (item) => {
                    const dst =
                        maintenance[item.type] ??
                        (maintenance[item.type] = {comment: '', otherComments: '', state: ''});

                    if (item.user === user) {
                        dst.state = 'maintenance';
                        if (dst.comment?.length) {
                            dst.comment += '\n';
                        }
                        dst.comment += item.comment;
                    } else {
                        dst.otherComments += `${item.timestamp} ${item.user}\t${item.comment}`;
                    }
                });
            } else {
                Object.assign(maintenance, {
                    ban: {
                        state: data.banned ? 'maintenance' : '',
                        comment: data.ban_message,
                    },
                    decommission: {
                        state: data.decommissioned ? 'maintenance' : '',
                        comment: data.decommission_message,
                    },
                    disable_scheduler_jobs: {
                        state: data.disable_scheduler_jobs ? 'maintenance' : '',
                    },
                    disable_tablet_cells: {state: data.disable_tablet_cells ? 'maintenance' : ''},
                    disable_write_sessions: {
                        state: data.disable_write_sessions ? 'maintenance' : '',
                    },
                } as typeof maintenance);
            }
            return {
                maintenance,
                resourceLimits: data.resource_limits,
                resourceLimitsOverrides: data.resource_limits_overrides,
                role: data.role,
            };
        });
    };
}

export function closeNodeMaintenanceModal(): NodeMaintenanceAction {
    return {type: NODE_MAINTENANCE_RESET};
}

function isMaintenanceApiAllowedForComponent(
    component: AddMaintenanceParams['component'],
    state: RootState,
) {
    switch (component) {
        case 'cluster_node':
            return isAllowedMaintenanceApiNodes(state);
        case 'http_proxy':
        case 'rpc_proxy':
            return isAllowedMaintenanceApiProxies(state);
        default:
            return false;
    }
}

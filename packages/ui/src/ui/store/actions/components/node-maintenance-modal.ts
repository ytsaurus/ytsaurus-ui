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
} from '../../../store/reducers/components/node-maintenance-modal';
import {
    isAllowedMaintenanceApiNodes,
    isAllowedMaintenanceApiProxies,
} from '../../../store/selectors/components/node-maintenance-modal';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {AddMaintenanceParams, BatchSubRequest} from '../../../../shared/yt-types';
import {updateComponentsNode} from './nodes/nodes';
import {getCurrentUserName} from '../../../store/selectors/global';
import {getProxies} from './proxies/proxies';
import _ from 'lodash';

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
): NodeMaintenanceThunkAction {
    return (dispatch, getState) => {
        const requests: Array<BatchSubRequest> = [];

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
                requests.push({
                    command,
                    parameters: {
                        component,
                        address,
                        type,
                        mine: true,
                        comment,
                    },
                });
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

        return wrapApiPromiseByToaster(ytApiV3Id.executeBatch(YTApiId.addMaintenance, {requests}), {
            toasterName: 'edit_node_' + address,
            isBatch: true,
            skipSuccessToast: true,
            errorTitle: `Failed to modify ${address}`,
        })
            .then(reloadNodeData)
            .catch(reloadNodeData);
    };
}

export function showNodeMaintenance(
    data: Pick<NodeMaintenanceState, 'address' | 'component'>,
): NodeMaintenanceThunkAction {
    return async (dispatch) => {
        const maintenance = await dispatch(loadNodeMaintenanceData(data));

        return dispatch({
            type: NODE_MAINTENANCE_PARTIAL,
            data: {...data, maintenance},
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
    ban?: boolean;
    ban_message?: string;
    decommission?: boolean;
    decommission_message?: string;
    disable_scheduler_jobs?: boolean;
    disable_tablet_cells?: boolean;
    disable_write_sessions?: boolean;

    maintenance_requests?: Record<string, MaintenanceRequestInfo>;
};

export function loadNodeMaintenanceData({
    address,
    component,
}: Pick<NodeMaintenanceState, 'address' | 'component'>): NodeMaintenanceThunkAction<
    Promise<NodeMaintenanceState['maintenance']>
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
                    ...(allowMaintenanceRequests
                        ? ['maintenance_requests']
                        : [
                              'ban',
                              'ban_message',
                              'decommission',
                              'decommission_message',
                              'disable_scheduler_jobs',
                              'disable_tablet_cells',
                              'disable_write_sessions',
                          ]),
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
                        (maintenance[item.type] = {comment: '', othersComment: ''});

                    if (item.user === user) {
                        dst.state = true;
                        if (dst.comment?.length) {
                            dst.comment += '\n';
                        }
                        dst.comment += item.comment;
                    } else {
                        dst.othersComment += `${item.timestamp} ${item.user}\t${item.comment}`;
                    }
                });
            } else {
                Object.assign(maintenance, {
                    ban: {state: data.ban, comment: data.ban_message},
                    decommission: {state: data.decommission, comment: data.decommission_message},
                    disable_scheduler_jobs: {state: data.disable_scheduler_jobs},
                    disable_tablet_cells: {state: data.disable_tablet_cells},
                    disable_write_sessions: {state: data.disable_write_sessions},
                } as typeof maintenance);
            }
            return maintenance;
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

import each_ from 'lodash/each';
import filter_ from 'lodash/filter';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import {USE_CACHE, USE_MAX_SIZE} from '../../../../shared/constants/yt-api';
import {splitBatchResults} from '../../../../shared/utils/error';
import hammer from '../../../common/hammer';
import ypath from '../../../common/thor/ypath';
import {SYSTEM_FETCH_NODES, UNAWARE} from '../../../constants';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {isRetryFutile} from '../../../utils/index';
import {getNodeffectiveState, incrementStateCounter} from '../../../utils/system/proxies';
import {showErrorPopup} from '../../../utils/utils';

import {ThunkAction} from 'redux-thunk';
import {NodeType} from '../../../../shared/constants/system';
import type {BatchSubRequest} from '../../../../shared/yt-types';
import type {RootState} from '../../../store/reducers';
import type {
    NodeEffectiveState,
    RackInfo,
    SystemNodeInfo,
    SystemNodesAction,
    SystemNodesState,
} from '../../../store/reducers/system/nodes';
import type {
    HttpProxiesState,
    RoleGroupInfo,
    RoleGroupItemInfo,
} from '../../../store/reducers/system/proxies';
import {toaster} from '../../../utils/toaster';

type SystemNodesThunkAction<T = void> = ThunkAction<T, RootState, unknown, SystemNodesAction>;

export function loadSystemNodes(
    nodeTypes: Array<NodeType>,
): SystemNodesThunkAction<Promise<undefined | {isRetryFutile?: boolean}>> {
    return (dispatch) => {
        dispatch({type: SYSTEM_FETCH_NODES.REQUEST});

        const requests: Array<BatchSubRequest> = [
            {
                command: 'list',
                parameters: {
                    path: '//sys/racks',
                    suppress_transaction_coordinator_sync: true,
                    suppress_upstream_sync: true,
                    ...USE_MAX_SIZE,
                },
            },
            ...nodeTypes.map((nodeType) => {
                return {
                    command: 'list' as const,
                    parameters: {
                        path: `//sys/${nodeType}`,
                        attributes: [
                            'state',
                            'banned',
                            'decommissioned',
                            'alert_count',
                            'full',
                            'rack',
                        ],
                        suppress_transaction_coordinator_sync: true,
                        suppress_upstream_sync: true,
                        ...USE_CACHE,
                        ...USE_MAX_SIZE,
                    },
                };
            }),
        ];

        return ytApiV3Id
            .executeBatch(YTApiId.systemNodes, {requests})
            .then((data) => {
                const {error, results} = splitBatchResults<string | Array<SystemNodeInfo>>(
                    data,
                    'Failed to get system nodes',
                );
                if (error) {
                    throw error;
                }

                const [rackNames, ...nodesByType] = results as [
                    _first: Array<string>,
                    ..._rest: Array<Array<SystemNodeInfo>>,
                ];

                const nodes = nodesByType.reduce((acc, items) => {
                    return acc.concat(items);
                }, []);

                const racks = prepareRacks(rackNames, nodes);

                const overviewCounters = extractNodeCounters(racks);
                const {rackGroups, counters} = groupRacks(racks);

                dispatch({
                    type: SYSTEM_FETCH_NODES.SUCCESS,
                    data: {
                        overviewCounters,
                        counters,
                        roleGroups: prepareRoleGroups(rackGroups),
                    },
                });
                return undefined;
            })
            .catch((error) => {
                dispatch({
                    type: SYSTEM_FETCH_NODES.FAILURE,
                    data: error,
                });

                const data = error?.response?.data || error;
                const {code, message} = data;

                toaster.add({
                    name: 'load/system/nodes',
                    autoHiding: false,
                    theme: 'danger',
                    content: `[code ${code}] ${message}`,
                    title: 'Could not load Nodes',
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });

                return {isRetryFutile: isRetryFutile(error.code)};
            });
    };
}

function groupRacks(racks: Array<RackInfo>) {
    const groupedRacks: Record<string, Array<RackInfo>> = {},
        counters: SystemNodesState['counters'] = {};
    const dataCenterNames = reduce_(
        racks,
        (acc, rack) => {
            const groupName = rack.name.split('-')[0];
            return groupName ? acc.add(groupName) : acc;
        },
        new Set<string>(),
    );
    // regroup racks by datacenters they belong to
    dataCenterNames.forEach((dcName) => {
        const rackGroup = filter_(racks, (rack) => {
            return rack.name === dcName || rack.name.startsWith(`${dcName}-`);
        });
        const isGroupEmpty = rackGroup.every((rack) => rack.empty);
        if (!isGroupEmpty) {
            groupedRacks[dcName] = rackGroup;
            counters[dcName] = extractNodeCounters(rackGroup);
        }
    });
    return {rackGroups: groupedRacks, counters};
}

type ExtendedCalculatedInfo = 'alerts_online' | 'alerts_offline';

function increaseFlagCounter<
    K extends keyof RackInfo['nodes'][number]['$attributes'] | ExtendedCalculatedInfo,
>(dst: Partial<Record<K, number>>, name: K, attrs: Record<K, boolean>) {
    if (dst[name] === undefined) {
        dst[name] = attrs[name] ? 1 : 0;
    } else {
        dst[name]! += attrs[name] ? 1 : 0;
    }
}

function extractNodeCounters(racks: Array<RackInfo>) {
    return reduce_(
        racks,
        (acc: HttpProxiesState['counters'], rack: RackInfo) => {
            acc.total += rack.nodes.length;

            each_(rack.nodes, (node) => {
                const attrs = node.$attributes;
                increaseFlagCounter(acc.flags, 'decommissioned', attrs);
                increaseFlagCounter(acc.flags, 'full', attrs);
                increaseFlagCounter(acc.flags, 'alerts', attrs);
                increaseFlagCounter(acc.flags, 'banned', attrs);

                incrementStateCounter(acc.states, attrs.state);
                if (!attrs.banned) {
                    incrementStateCounter(acc.effectiveStates, attrs.effectiveState);
                }
            });

            return acc;
        },
        {
            total: 0,
            flags: {
                decommissioned: 0,
                banned: 0,
                full: 0,
                alerts: 0,
            },
            states: {}, // For right side counters
            effectiveStates: {}, // For state progress bar
        } as HttpProxiesState['counters'],
    );
}

function prepareNodes(nodes: Array<SystemNodeInfo>) {
    return nodes.sort((nodeA, nodeB) => {
        return nodeA.$value > nodeB.$value ? 1 : -1;
    });
}

function prepareRackNames(rackNames: Array<string>) {
    rackNames.sort((rackA, rackB) => {
        return hammer.utils.compareVectors(
            hammer.format['RackToVector'](rackA),
            hammer.format['RackToVector'](rackB),
        );
    });

    rackNames.unshift(UNAWARE);

    return rackNames;
}

function createRack(name: string): RackInfo {
    return {
        name,
        empty: true,
        nodes: [],
    };
}

function insertNodeToRack(racks: Record<string, RackInfo>, node: SystemNodeInfo) {
    const rackName = ypath.getValue(node, '/@rack');
    const state: NodeEffectiveState = ypath.getValue(node, '/@state');
    const banned: boolean = ypath.getBoolean(node, '/@banned');
    const decommissioned: boolean = ypath.getBoolean(node, '/@decommissioned');
    const full: boolean = ypath.getBoolean(node, '/@full');
    const alerts = Boolean(ypath.getValue(node, '/@alert_count'));

    const effectiveFlag =
        (decommissioned && 'decommissioned') ||
        (full && 'full') ||
        (alerts && 'alerts') ||
        undefined;

    const rack = racks[Object.hasOwnProperty.call(racks, rackName) ? rackName : UNAWARE];

    rack.empty = false;

    rack.nodes.push({
        $value: node.$value,
        $attributes: {
            ...node.$attributes,
            effectiveState: state,
            effectiveFlag: effectiveFlag,
            alerts,
            banned,
        },
    });
}

function prepareRacks(rackNames: Array<string>, nodes: Array<SystemNodeInfo>) {
    const racks = reduce_(
        prepareRackNames(rackNames),
        (acc, name) => {
            acc[name] = createRack(name);
            return acc;
        },
        {} as Record<string, RackInfo>,
    );

    each_(prepareNodes(nodes), (node) => insertNodeToRack(racks, node));

    return map_(racks);
}

function prepareRoleGroups(rackGroups: Record<string, Array<RackInfo>>) {
    const roleGroups = reduce_(
        rackGroups,
        (acc, item, key) => {
            const groups = rackInfo2roleGroup(item);
            const toAdd = groups.filter((g) => {
                return g.counters.total > 0;
            });
            if (toAdd.length) {
                acc[key] = toAdd;
            }
            return acc;
        },
        {} as Record<string, Array<RoleGroupInfo>>,
    );
    return roleGroups;
}

function rackInfo2roleGroup(data: Array<RackInfo>): Array<RoleGroupInfo> {
    return map_(data, (rack) => {
        const flags = {
            dec_online: 0,
            dec_banned: 0,
            dec_offline: 0,
            alerts_banned: 0,
            alerts_offline: 0,
            alerts_online: 0,
        };
        const res: RoleGroupInfo = {
            name: rack.name,
            items: [],
            counters: {
                total: rack.nodes.length,
                effectiveStates: {},
                states: {},
                flags,
            },
        };
        rack.nodes.forEach((node) => {
            const {state, effectiveState, banned, alerts, decommissioned} = node.$attributes;
            const info: RoleGroupItemInfo = {
                name: node.$value,
                state,
                role: rack.name,
                effectiveState: getNodeffectiveState(effectiveState),
                banned,
                alerts,
                decommissioned,
                full: node.$attributes?.full,
            };
            incrementStateCounter(res.counters.states, info.state);
            if (!banned) {
                incrementStateCounter(res.counters.effectiveStates, info.effectiveState);
            }

            increaseFlagCounter(res.counters.flags, 'decommissioned', node.$attributes);
            increaseFlagCounter(res.counters.flags, 'full', node.$attributes);
            increaseFlagCounter(res.counters.flags, 'alerts', node.$attributes);
            increaseFlagCounter(res.counters.flags, 'banned', node.$attributes);

            const isStateOnlineOffline = state === 'online' || state === 'offline';

            if (alerts) {
                if (banned) {
                    ++flags['alerts_banned'];
                } else if (isStateOnlineOffline) {
                    ++flags[`alerts_${state}`];
                }
            }

            if (decommissioned) {
                if (banned) {
                    ++flags['dec_banned'];
                } else if (isStateOnlineOffline) {
                    ++flags[`dec_${state}`];
                }
            }

            res.items.push(info);
        });

        return res;
    });
}

import each_ from 'lodash/each';
import filter_ from 'lodash/filter';
import reduce_ from 'lodash/reduce';
import map_ from 'lodash/values';

import {Toaster} from '@gravity-ui/uikit';

import ypath from '../../../common/thor/ypath';
import hammer from '../../../common/hammer';
import Updater from '../../../utils/hammer/updater';
import {isRetryFutile} from '../../../utils/index';
import {incrementKeyCounter} from '../../../utils/system/proxies';
import {showErrorPopup, splitBatchResults} from '../../../utils/utils';
import {SYSTEM_FETCH_NODES, UNAWARE, USE_CACHE, USE_MAX_SIZE} from '../../../constants';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getSystemNodesNodeTypesToLoad} from '../../../store/selectors/system/nodes';

import type {RootState} from '../../../store/reducers';
import type {
    RackInfo,
    SystemNodeInfo,
    SystemNodesAction,
    SystemNodesState,
} from '../../../store/reducers/system/nodes';
import type {BatchSubRequest} from '../../../../shared/yt-types';
import type {HttpProxiesState} from 'store/reducers/system/proxies';
import {ThunkAction} from 'redux-thunk';

const NODES_UPDATER_ID = 'system_nodes';

const updater = new Updater();

type SystemNodesThunkAction = ThunkAction<void, RootState, unknown, SystemNodesAction>;

export function loadNodes(): SystemNodesThunkAction {
    return (dispatch) => {
        updater.add(NODES_UPDATER_ID, () => dispatch(getNodes()), 30 * 1000);
    };
}

export function cancelLoadNodes() {
    return () => {
        updater.remove(NODES_UPDATER_ID);
    };
}

function getNodes(): SystemNodesThunkAction {
    return (dispatch, getState) => {
        dispatch({type: SYSTEM_FETCH_NODES.REQUEST});

        const nodeTypes = getSystemNodesNodeTypesToLoad(getState());

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
                const {error, results} = splitBatchResults<string | Array<SystemNodeInfo>>(data);
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
                        racks: undefined,
                        rackGroups,
                        overviewCounters,
                        counters,
                    },
                });
            })
            .catch((error) => {
                dispatch({
                    type: SYSTEM_FETCH_NODES.FAILURE,
                    data: error,
                });

                const data = error?.response?.data || error;
                const {code, message} = data;

                const toaster = new Toaster();

                toaster.add({
                    name: 'load/system/nodes',
                    allowAutoHiding: false,
                    type: 'error',
                    content: `[code ${code}] ${message}`,
                    title: 'Could not load Nodes',
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });
                if (isRetryFutile(error.code)) {
                    dispatch(cancelLoadNodes());
                }
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

function increaseFlagCounter<K extends keyof RackInfo['nodes'][number]['$attributes']>(
    dst: Record<K, number>,
    name: K,
    attrs: Record<K, boolean>,
) {
    dst[name] += attrs[name] ? 1 : 0;
}

function extractNodeCounters(racks: Array<RackInfo>) {
    return reduce_(
        racks,
        (acc: HttpProxiesState['counters'], rack: RackInfo) => {
            acc.total += rack.nodes.length;

            each_(rack.nodes, (node) => {
                const attrs = node.$attributes;
                increaseFlagCounter(acc.flags, 'decomissioned', attrs);
                increaseFlagCounter(acc.flags, 'banned', attrs);
                increaseFlagCounter(acc.flags, 'full', attrs);
                increaseFlagCounter(acc.flags, 'alerts', attrs);

                incrementKeyCounter(acc.states, attrs.state);
                incrementKeyCounter(acc.effectiveStates, attrs.effectiveState);
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
    const state = ypath.getValue(node, '/@state');
    const banned = ypath.getBoolean(node, '/@banned');
    const decommissioned = ypath.getBoolean(node, '/@decommissioned');
    const full = ypath.getBoolean(node, '/@full');
    const alerts = Boolean(ypath.getValue(node, '/@alert_count'));

    const effectiveState = banned ? 'banned' : state;
    const effectiveFlag =
        (decommissioned && 'decommissioned') || (full && 'full') || (alerts && 'alerts') || '';

    const rack = racks[Object.hasOwnProperty.call(racks, rackName) ? rackName : UNAWARE];

    rack.empty = false;

    rack.nodes.push({
        $value: node.$value,
        $attributes: {
            ...node.$attributes,
            effectiveState: effectiveState,
            effectiveFlag: effectiveFlag,
            alerts,
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

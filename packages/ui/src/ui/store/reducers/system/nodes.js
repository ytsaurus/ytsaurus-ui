import _ from 'lodash';
import ypath from '../../../common/thor/ypath';
import hammer from '../../../common/hammer';
import {FETCH_NODES} from '../../../store/actions/system/nodes';
import {UNAWARE} from '../../../constants/index';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';

function increaseFlagCounter(counters, name, node) {
    counters.flags[name] += node.$attributes[name] ? 1 : 0;
}

function incrementStateCounter(counters, name, node) {
    const state = node.$attributes[name];
    const stateCounters = counters[name + 's'];
    stateCounters[state] = stateCounters[state] || 0;
    stateCounters[state]++;
}

function iterateRackStatistics(statistics, rack) {
    statistics.total += rack.nodes.length;

    _.each(rack.nodes, (node) => {
        increaseFlagCounter(statistics, 'decommissioned', node);
        increaseFlagCounter(statistics, 'banned', node);
        increaseFlagCounter(statistics, 'full', node);
        increaseFlagCounter(statistics, 'alerts', node);

        incrementStateCounter(statistics, 'state', node);
        incrementStateCounter(statistics, 'effectiveState', node);
    });

    return statistics;
}

function extractNodeCounters(racks) {
    return _.reduce(racks, iterateRackStatistics, {
        total: 0,
        flags: {
            decommissioned: 0,
            banned: 0,
            full: 0,
            alerts: 0,
        },
        states: {}, // For right side counters
        effectiveStates: {}, // For state progress bar
    });
}

// Node supported states
// DEFINE_ENUM(ENodeState,
//  // Not registered.
//  ((Offline)     (0))
//  // Registered but did not report the first heartbeat yet.
//  ((Registered)  (1))
//  // Registered and reported the first heartbeat.
//  ((Online)      (2))
//  // Unregistered and placed into disposal queue.
//  ((Unregistered)(3))
//  // Indicates that state varies across cells.
//  ((Mixed)       (4))
//  );

function prepareNodes(nodes) {
    return nodes.sort((nodeA, nodeB) => {
        return nodeA.$value > nodeB.$value ? 1 : -1;
    });
}

function prepareRackNames(rackNames) {
    rackNames.sort((rackA, rackB) => {
        return hammer.utils.compareVectors(
            hammer.format['RackToVector'](rackA),
            hammer.format['RackToVector'](rackB),
        );
    });

    rackNames.unshift(UNAWARE);

    return rackNames;
}

function createRack() {
    return {
        empty: true,
        nodes: [],
    };
}

function iterateNode(racks, node) {
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
            banned: banned,
            decommissioned: decommissioned,
            alerts: alerts,
            full: full,
            state: state,
            effectiveState: effectiveState,
            effectiveFlag: effectiveFlag,
        },
    });
}

function prepareRacks(rackNames, nodes) {
    const racks = _.reduce(
        prepareRackNames(rackNames),
        (racks, name) => {
            racks[name] = createRack();
            return racks;
        },
        {},
    );

    _.each(prepareNodes(nodes), (node) => iterateNode(racks, node));

    return hammer.utils.objectToArray(racks, 'name');
}

const initialState = {
    fetching: false,
    error: null,
    racks: undefined,
    overviewCounters: undefined,
    counters: undefined,
    rackGroups: undefined,
};

function groupRacks(racks) {
    const groupedRacks = {},
        counters = {};
    // get list of datacenter names
    const rackGroups = _.reduce(
        racks,
        (names, rack) => {
            const groupName = rack.name.split('-')[0];
            return groupName ? names.add(groupName) : names;
        },
        new Set(),
    );
    // regroup racks by datacenters they belong to
    rackGroups.forEach((groupName) => {
        const rackGroup = _.filter(racks, (rack) => {
            return rack.name === groupName || rack.name.startsWith(`${groupName}-`);
        });
        const isGroupEmpty = _.every(rackGroup, (rack) => rack.empty);
        if (!isGroupEmpty) {
            groupedRacks[groupName] = rackGroup;
            counters[groupName] = extractNodeCounters(rackGroup);
        }
    });
    return [groupedRacks, counters];
}

const MAX_RACKS_TO_NOT_GROUP = 12;

function nodes(state = initialState, action) {
    let racks, nodes, rackNames;
    switch (action.type) {
        case FETCH_NODES.REQUEST:
            return {...state, fetching: true};

        case FETCH_NODES.SUCCESS:
            ({nodes, racks: rackNames} = action.data);
            racks = prepareRacks(ypath.getValue(rackNames), ypath.getValue(nodes));
            if (racks.length <= MAX_RACKS_TO_NOT_GROUP) {
                return {
                    ...state,
                    fetching: false,
                    error: null,
                    racks: racks,
                    overviewCounters: extractNodeCounters(racks),
                    counters: undefined,
                    rackGroups: undefined,
                };
            } else {
                const [groupedRacks, counters] = groupRacks(racks);
                return {
                    ...state,
                    fetching: false,
                    error: null,
                    racks: undefined,
                    rackGroups: groupedRacks,
                    overviewCounters: extractNodeCounters(racks),
                    counters,
                };
            }
        case FETCH_NODES.FAILURE:
            return {...state, fetching: false, error: action.data};
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(initialState, {}, nodes);

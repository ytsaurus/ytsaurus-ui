import {APPLY_SETUP} from '../../../../../constants/components/nodes/nodes';
import _ from 'lodash';

import type {applyPreset} from '../../../../../store/actions/components/nodes/nodes';

interface RangeBorder {
    value: number | null;
    valid: boolean;
}

export interface NodeRange {
    from: RangeBorder;
    to: RangeBorder;
}

export const groupFilterInitialState: NodeRange = {
    from: {
        value: null,
        valid: true,
    },
    to: {
        value: null,
        valid: true,
    },
};

export interface TagFilter {
    mode?: 'filter' | 'union' | 'intersection';
    selected?: Array<string>;

    filter?: string;
    useRegexp?: boolean;
    regexpError?: string;
}

export type FlagState = 'all' | 'enabled' | 'disabled';

export interface NodesSetupState {
    default: {
        physicalHost: string;
        tag: string | TagFilter;
        state: 'all' | 'online' | 'offline' | 'mixed' | 'registered' | 'unregistered' | 'unknown';
        schedulerJobs: FlagState;
        writeSessions: FlagState;
        tabletCells: FlagState;
        rack: string | TagFilter;
        banned: FlagState;
        decommissioned: FlagState;
        full: FlagState;
        alerts: FlagState;
    };
    storage: {
        sessions: NodeRange;
        chunks: NodeRange;

        spaceUsed: NodeRange;
        spaceTotal: NodeRange;

        ioDefault: NodeRange;
        ioCache: NodeRange;
        ioSsdBlobs: NodeRange;
        ioSsdJournals: NodeRange;
    };
    cpu: {
        blobSession: NodeRange;
        blockCache: NodeRange;
        chunkBlockMeta: NodeRange;
        chunkMeta: NodeRange;
        footprint: NodeRange;
        query: NodeRange;
        systemJobs: NodeRange;
        versionedChunkMeta: NodeRange;
        tabletDynamicUsed: NodeRange;
        tabletDynamicTotal: NodeRange;
        tabletStaticUsed: NodeRange;
        tabletStaticTotal: NodeRange;
        userJobsUsed: NodeRange;
        userJobsTotal: NodeRange;
    };

    resources: {
        userSlotsUsed: NodeRange;
        userSlotsTotal: NodeRange;
        sealSlotsUsed: NodeRange;
        sealSlotsTotal: NodeRange;
        repairSlotsUsed: NodeRange;
        repairSlotsTotal: NodeRange;
        removalSlotsUsed: NodeRange;
        removalSlotsTotal: NodeRange;
        replicationSlotsUsed: NodeRange;
        replicationSlotsTotal: NodeRange;
    };
    tablets: {
        all: NodeRange;
        none: NodeRange;
        leading: NodeRange;
        following: NodeRange;
        followerRecovery: NodeRange;
        leaderRecovery: NodeRange;
        stopped: NodeRange;
        elections: NodeRange;
        staticUsed: NodeRange;
        staticTotal: NodeRange;
        dynamicUsed: NodeRange;
        dynamicTotal: NodeRange;
    };
}

export const initialFiltersState: NodesSetupState = {
    default: {
        physicalHost: '',
        tag: {mode: 'filter', filter: '', selected: []},
        state: 'all',
        schedulerJobs: 'all',
        writeSessions: 'all',
        tabletCells: 'all',
        rack: '',
        banned: 'all',
        decommissioned: 'all',
        full: 'all',
        alerts: 'all',
    },
    storage: {
        sessions: _.cloneDeep(groupFilterInitialState),
        chunks: _.cloneDeep(groupFilterInitialState),

        spaceUsed: _.cloneDeep(groupFilterInitialState),
        spaceTotal: _.cloneDeep(groupFilterInitialState),

        ioDefault: _.cloneDeep(groupFilterInitialState),
        ioCache: _.cloneDeep(groupFilterInitialState),
        ioSsdBlobs: _.cloneDeep(groupFilterInitialState),
        ioSsdJournals: _.cloneDeep(groupFilterInitialState),
    },
    cpu: {
        blobSession: _.cloneDeep(groupFilterInitialState),
        blockCache: _.cloneDeep(groupFilterInitialState),
        chunkBlockMeta: _.cloneDeep(groupFilterInitialState),
        chunkMeta: _.cloneDeep(groupFilterInitialState),
        footprint: _.cloneDeep(groupFilterInitialState),
        query: _.cloneDeep(groupFilterInitialState),
        systemJobs: _.cloneDeep(groupFilterInitialState),
        versionedChunkMeta: _.cloneDeep(groupFilterInitialState),

        tabletDynamicUsed: _.cloneDeep(groupFilterInitialState),
        tabletDynamicTotal: _.cloneDeep(groupFilterInitialState),

        tabletStaticUsed: _.cloneDeep(groupFilterInitialState),
        tabletStaticTotal: _.cloneDeep(groupFilterInitialState),

        userJobsUsed: _.cloneDeep(groupFilterInitialState),
        userJobsTotal: _.cloneDeep(groupFilterInitialState),
    },
    resources: {
        userSlotsUsed: _.cloneDeep(groupFilterInitialState),
        userSlotsTotal: _.cloneDeep(groupFilterInitialState),

        sealSlotsUsed: _.cloneDeep(groupFilterInitialState),
        sealSlotsTotal: _.cloneDeep(groupFilterInitialState),

        repairSlotsUsed: _.cloneDeep(groupFilterInitialState),
        repairSlotsTotal: _.cloneDeep(groupFilterInitialState),

        removalSlotsUsed: _.cloneDeep(groupFilterInitialState),
        removalSlotsTotal: _.cloneDeep(groupFilterInitialState),

        replicationSlotsUsed: _.cloneDeep(groupFilterInitialState),
        replicationSlotsTotal: _.cloneDeep(groupFilterInitialState),
    },
    tablets: {
        all: _.cloneDeep(groupFilterInitialState),

        none: _.cloneDeep(groupFilterInitialState),
        leading: _.cloneDeep(groupFilterInitialState),
        following: _.cloneDeep(groupFilterInitialState),
        followerRecovery: _.cloneDeep(groupFilterInitialState),
        leaderRecovery: _.cloneDeep(groupFilterInitialState),
        stopped: _.cloneDeep(groupFilterInitialState),
        elections: _.cloneDeep(groupFilterInitialState),

        staticUsed: _.cloneDeep(groupFilterInitialState),
        staticTotal: _.cloneDeep(groupFilterInitialState),

        dynamicUsed: _.cloneDeep(groupFilterInitialState),
        dynamicTotal: _.cloneDeep(groupFilterInitialState),
    },
};

// We need default filters state for the 'All' filter preset.
// redux-location-state changes the initialState when query string is not empty.
export const initialState = _.cloneDeep(initialFiltersState);

export default (state = initialState, action: NodesSetupAction) => {
    switch (action.type) {
        case APPLY_SETUP: {
            if (action.data.default?.tag) {
                const dst = {
                    ...state,
                    default: {
                        ...state.default,
                        tag: '',
                    },
                };
                return _.merge(dst, action.data);
            } else {
                return _.merge({}, state, action.data);
            }
        }
        default:
            return state;
    }
};

export type NodesSetupAction = ReturnType<typeof applyPreset>;

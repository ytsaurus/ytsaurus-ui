import {APPLY_SETUP} from '../../../../../constants/components/nodes/nodes';

import cloneDeep_ from 'lodash/cloneDeep';
import merge_ from 'lodash/merge';

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
        state: Array<
            | 'all'
            | 'online'
            | 'offline'
            | 'mixed'
            | 'registered'
            | 'unregistered'
            | 'unknown'
            | string
        >;
        schedulerJobs: FlagState;
        writeSessions: FlagState;
        tabletCells: FlagState;
        rack: string | TagFilter;
        banned: FlagState;
        decommissioned: FlagState;
        full: FlagState;
        alertCount: FlagState;
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
        state: ['all'],
        schedulerJobs: 'all',
        writeSessions: 'all',
        tabletCells: 'all',
        rack: '',
        banned: 'all',
        decommissioned: 'all',
        full: 'all',
        alertCount: 'all',
    },
    storage: {
        sessions: cloneDeep_(groupFilterInitialState),
        chunks: cloneDeep_(groupFilterInitialState),

        spaceUsed: cloneDeep_(groupFilterInitialState),
        spaceTotal: cloneDeep_(groupFilterInitialState),

        ioDefault: cloneDeep_(groupFilterInitialState),
        ioCache: cloneDeep_(groupFilterInitialState),
        ioSsdBlobs: cloneDeep_(groupFilterInitialState),
        ioSsdJournals: cloneDeep_(groupFilterInitialState),
    },
    cpu: {
        blobSession: cloneDeep_(groupFilterInitialState),
        blockCache: cloneDeep_(groupFilterInitialState),
        chunkBlockMeta: cloneDeep_(groupFilterInitialState),
        chunkMeta: cloneDeep_(groupFilterInitialState),
        footprint: cloneDeep_(groupFilterInitialState),
        query: cloneDeep_(groupFilterInitialState),
        systemJobs: cloneDeep_(groupFilterInitialState),
        versionedChunkMeta: cloneDeep_(groupFilterInitialState),

        tabletDynamicUsed: cloneDeep_(groupFilterInitialState),
        tabletDynamicTotal: cloneDeep_(groupFilterInitialState),

        tabletStaticUsed: cloneDeep_(groupFilterInitialState),
        tabletStaticTotal: cloneDeep_(groupFilterInitialState),

        userJobsUsed: cloneDeep_(groupFilterInitialState),
        userJobsTotal: cloneDeep_(groupFilterInitialState),
    },
    resources: {
        userSlotsUsed: cloneDeep_(groupFilterInitialState),
        userSlotsTotal: cloneDeep_(groupFilterInitialState),

        sealSlotsUsed: cloneDeep_(groupFilterInitialState),
        sealSlotsTotal: cloneDeep_(groupFilterInitialState),

        repairSlotsUsed: cloneDeep_(groupFilterInitialState),
        repairSlotsTotal: cloneDeep_(groupFilterInitialState),

        removalSlotsUsed: cloneDeep_(groupFilterInitialState),
        removalSlotsTotal: cloneDeep_(groupFilterInitialState),

        replicationSlotsUsed: cloneDeep_(groupFilterInitialState),
        replicationSlotsTotal: cloneDeep_(groupFilterInitialState),
    },
    tablets: {
        all: cloneDeep_(groupFilterInitialState),

        none: cloneDeep_(groupFilterInitialState),
        leading: cloneDeep_(groupFilterInitialState),
        following: cloneDeep_(groupFilterInitialState),
        followerRecovery: cloneDeep_(groupFilterInitialState),
        leaderRecovery: cloneDeep_(groupFilterInitialState),
        stopped: cloneDeep_(groupFilterInitialState),
        elections: cloneDeep_(groupFilterInitialState),

        staticUsed: cloneDeep_(groupFilterInitialState),
        staticTotal: cloneDeep_(groupFilterInitialState),

        dynamicUsed: cloneDeep_(groupFilterInitialState),
        dynamicTotal: cloneDeep_(groupFilterInitialState),
    },
};

// We need default filters state for the 'All' filter preset.
// redux-location-state changes the initialState when query string is not empty.
export const initialState = cloneDeep_(initialFiltersState);

export default (state = initialState, action: NodesSetupAction) => {
    switch (action.type) {
        case APPLY_SETUP: {
            return merge_({}, state, action.data);
        }
        default:
            return state;
    }
};

export type NodesSetupAction = ReturnType<typeof applyPreset>;

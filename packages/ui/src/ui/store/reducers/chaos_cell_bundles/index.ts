import type {Action} from 'redux';

import {
    CHAOS_BUNDLES_ACTIVE_ACCOUNT,
    CHAOS_BUNDLES_LOAD_FAILURE,
    CHAOS_BUNDLES_LOAD_REQUEST,
    CHAOS_BUNDLES_LOAD_SUCCESS,
    CHAOS_BUNDLES_PARTIAL,
} from '../../../constants/tablets';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {BundleControllerConfig} from '../../../store/reducers/tablet_cell_bundles';
import type {ActionD, SortState, YTError} from '../../../types';

export interface ChaosBundlesState {
    loaded: boolean;
    loading: boolean;
    error: YTError | undefined;

    cells: Array<ChaosCell>;
    bundles: Array<ChaosBundle>;

    bundlesNameFilter: string;
    bundlesAccountFilter: string;
    bundlesTagNodeFilter: string;

    cellsIdFilter: string;
    cellsBundleFilter: string;
    cellsHostFilter: string;

    bundlesSort: SortState<keyof ChaosBundle>;
    cellsSort: SortState<keyof ChaosCell>;

    activeBundle: string;

    bundlesTableMode: BundlesTableMode;
}

export type BundlesTableMode = 'default' | 'tablets' | 'tablets_memory';

export interface ChaosCell {
    id: string;
    bundle: string;
    health: ChaosBundle['health'];
    memory: number;
    compressed: number;
    tablets: number;
    uncompressed: number;
    peerAddress: string;
    state: string;

    peer: ChaosCellPeer;
    peers: Array<ChaosCellPeer>;
}

export interface ChaosCellPeer {
    address: string;
    last_seen: string;
    state: string;
}

export interface ChaosBundle {
    $attributes: unknown;

    alerts: number;
    banned: number;
    decommissioned: number;
    health: 'good' | 'failed' | 'initializing';
    full: number;
    online: number;
    offline: number;
    bundle: string;
    compressed: number;
    memory: number;
    nodes?: Array<string>;
    tabletCells: number;
    tablets: number;
    uncompressed: number;

    bundle_controller_target_config: BundleControllerConfig;
    enable_bundle_controller: boolean;
    changelog_account: string;
    snapshot_account: string;
    node_tag_filter: string;
    unique_node_tag: boolean;
    zone?: string;

    tablet_count: number;
    tablet_count_limit: number;
    tablet_count_free: number;
    tablet_count_percentage: number;

    tablet_static_memory: number;
    tablet_static_memory_limit: number;
    tablet_static_memory_free: number;
    tablet_static_memory_percentage: number;
}

const persistedState: Pick<
    ChaosBundlesState,
    | 'bundlesSort'
    | 'cellsSort'
    | 'bundlesNameFilter'
    | 'bundlesAccountFilter'
    | 'bundlesTagNodeFilter'
    | 'cellsHostFilter'
    | 'cellsBundleFilter'
    | 'activeBundle'
    | 'bundlesTableMode'
> = {
    bundlesSort: {column: 'bundle', order: 'asc'},
    cellsSort: {},

    bundlesNameFilter: '',
    bundlesAccountFilter: '',
    bundlesTagNodeFilter: '',

    cellsBundleFilter: '',
    cellsHostFilter: '',

    activeBundle: '',
    bundlesTableMode: 'default',
};

const ephemeralState: Pick<
    ChaosBundlesState,
    Exclude<keyof ChaosBundlesState, keyof typeof persistedState>
> = {
    loading: false,
    loaded: false,
    error: undefined,

    cells: [],
    bundles: [],

    cellsIdFilter: '',
};

export const initialState: ChaosBundlesState = {
    ...ephemeralState,
    ...persistedState,
};

function reducer(state = initialState, action: ChaosBundlesAction): ChaosBundlesState {
    switch (action.type) {
        case CHAOS_BUNDLES_LOAD_REQUEST:
            return {...state, loading: true};
        case CHAOS_BUNDLES_LOAD_FAILURE:
            return {...state, loading: false, error: action.data};
        case CHAOS_BUNDLES_LOAD_SUCCESS:
            return {...state, ...action.data, loaded: true, loading: false};
        case CHAOS_BUNDLES_PARTIAL:
            return {...state, ...action.data};
        case CHAOS_BUNDLES_ACTIVE_ACCOUNT:
            return {...state, ...action.data};
    }
    return state;
}

export type ChaosPartialAction = ActionD<
    typeof CHAOS_BUNDLES_PARTIAL,
    Partial<
        Pick<
            ChaosBundlesState,
            | 'bundlesSort'
            | 'bundlesNameFilter'
            | 'bundlesAccountFilter'
            | 'bundlesTagNodeFilter'
            | 'cellsSort'
            | 'cellsIdFilter'
            | 'cellsBundleFilter'
            | 'cellsHostFilter'
            | 'bundlesTableMode'
        >
    >
>;

export type ChaosBundlesAction =
    | Action<typeof CHAOS_BUNDLES_LOAD_REQUEST>
    | ActionD<typeof CHAOS_BUNDLES_LOAD_FAILURE, YTError>
    | ActionD<
          typeof CHAOS_BUNDLES_LOAD_SUCCESS,
          {cells: Array<ChaosCell>; bundles: Array<ChaosBundle>}
      >
    | ChaosPartialAction
    | ActionD<typeof CHAOS_BUNDLES_ACTIVE_ACCOUNT, Pick<ChaosBundlesState, 'activeBundle'>>;

const chaos_cell_bundles = mergeStateOnClusterChange(ephemeralState, persistedState, reducer);

export default chaos_cell_bundles;

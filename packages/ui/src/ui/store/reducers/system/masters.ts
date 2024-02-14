import _ from 'lodash';
import {Action} from 'redux';
import {MasterInstance} from '../../selectors/system/masters';
import {ActionD} from '../../../types';
import {YTError} from '../../../../@types/types';
import {BatchResultsItem} from '../../../../shared/yt-types';
import {
    FETCH_MASTER_CONFIG,
    FETCH_MASTER_DATA,
    SET_MASTER_ALERTS,
} from '../../actions/system/masters';
import {mergeStateOnClusterChange} from '../utils';

function incrementStateCounters(
    counters: MastersState['counters'],
    state: keyof MastersState['counters']['states'],
) {
    const stateCounters = counters.states;
    stateCounters[state] = stateCounters[state] || 0;
    stateCounters[state]++;
}

function calculateStatusCounts(masters: Array<MasterDataItem | undefined>) {
    const initialStatusCount = {
        success: 0,
        recovery: 0,
        unavailable: 0,
    };

    return _.reduce(
        masters,
        (result, master) => {
            if (!master || !master.state) {
                return result;
            }

            switch (master.state) {
                case 'stopped':
                case 'unknown':
                    result.unavailable += 1;
                    break;
                case 'elections':
                case 'follower_recovery':
                case 'leader_recovery':
                    result.recovery += 1;
                    break;
                case 'following':
                case 'leading':
                    result.success += 1;
            }

            return result;
        },
        initialStatusCount,
    );
}

function extractMasterCounters(
    primary: Required<MastersState['primary']>,
    secondary: Array<Required<MasterGroupData>>,
    {recovery, unavailable}: MastersState['counters']['states'],
) {
    const counters: MastersState['counters'] = {
        total: secondary.length + 1,
        flags: {
            recovery: recovery,
            unavailable: unavailable,
            primary: 1,
            secondary: secondary.length,
        },
        states: {},
    };

    incrementStateCounters(counters, primary.quorum.status);

    _.each(secondary, (masters) => {
        incrementStateCounters(counters, masters.quorum.status);
    });

    return counters;
}

function getQuorum(masters: Array<MasterInstance>) {
    let existsProblematicInstance = false;
    let existsLeading = false;
    let leaderCommitedVersion;

    _.each(masters, (master) => {
        const masterData = master.$attributes;
        const state = master.state;

        if (masterData && state !== 'following' && state !== 'leading') {
            existsProblematicInstance = true;
        }

        if (masterData && state === 'leading') {
            existsLeading = true;
            leaderCommitedVersion = master.committedVersion;
        }
    });

    let status;

    if (existsLeading && !existsProblematicInstance) {
        status = 'quorum' as const;
    } else if (existsLeading && existsProblematicInstance) {
        status = 'weak-quorum' as const;
    } else {
        status = 'no-quorum' as const;
    }
    // TEST DATA
    // status = ['quorum', 'weak-quorum', 'no-quorum'][Math.floor(Math.random() * 3)];

    return {status, leaderCommitedVersion};
}

function getLeader(instances: any) {
    return _.find(instances, (instance) => {
        return instance.state === 'leading';
    });
}

export type MasterAlert = {
    code: number;
    message: string;
    attributes: {
        datetime: string;
        unrecognized_options: Record<string, string>;
    };
};

export interface MastersState {
    fetchingConfig: boolean;
    fetchingData: boolean;
    error?: YTError;
    initialized: boolean;

    mastersDataConfig?: MastersConfigResponse;
    masterData?: MasterDataResponse;

    counters: {
        total?: number;
        flags?: {
            recovery: number;
            unavailable: number;
            primary: number;
            secondary: number;
        };
        states: Record<string, number>;
    };
    primary: MasterGroupData;
    secondary: Array<MasterGroupData>;
    providers: MasterGroupData;
    discovery: MasterGroupData;
    queueAgents: MasterGroupData;
    alerts: MasterAlert[];
}

export interface MasterGroupData {
    instances: Array<MasterInstance>;
    leader?: MasterInstance;
    quorum?: {
        status: 'quorum' | 'weak-quorum' | 'no-quorum';
        leaderCommitedVersion?: string;
    };
    cellTag?: number;
}

const initialState: MastersState = {
    fetchingConfig: false,
    fetchingData: false,
    error: undefined,
    initialized: false,

    mastersDataConfig: undefined,
    masterData: undefined,

    counters: {states: {}},
    primary: {
        instances: [],
        leader: undefined,
        quorum: undefined,
        cellTag: undefined,
    },
    secondary: [],
    providers: {
        instances: [],
        leader: undefined,
        quorum: undefined,
        cellTag: undefined,
    },
    discovery: {
        instances: [],
        cellTag: undefined,
    },
    queueAgents: {
        instances: [],
    },
    alerts: [],
};

export interface ResponseItem {
    host: string;
    physicalHost?: string;
    attributes: {
        native_cell_tag: number;
        annotations: unknown;
    };
    state?: 'online' | 'offline' | 'unknown';
}

export interface ResponseItemsGroup {
    addresses?: Array<ResponseItem>;
    cellTag?: number;
}

export interface MastersConfigResponse {
    primaryMaster: ResponseItemsGroup;
    secondaryMasters: Array<ResponseItemsGroup>;
    discoveryServers: ResponseItemsGroup;
    queueAgents: ResponseItemsGroup;
    timestampProviders: ResponseItemsGroup;
}

function processMastersConfig(
    state: MastersState,
    {
        primaryMaster,
        secondaryMasters,
        timestampProviders,
        discoveryServers,
        queueAgents,
    }: MastersConfigResponse,
) {
    const res = {
        primary: {
            instances: _.map(_.sortBy(primaryMaster.addresses, 'host'), (address) => {
                return new MasterInstance(address, 'primary', primaryMaster.cellTag);
            }),
            cellTag: primaryMaster.cellTag,
        },
        secondary: _.map(secondaryMasters, (master) => {
            return {
                instances: _.map(_.sortBy(master.addresses, 'host'), (address) => {
                    return new MasterInstance(address, 'secondary', master.cellTag);
                }),
                cellTag: master.cellTag,
            };
        }),
        providers: {
            instances: _.map(_.sortBy(timestampProviders.addresses, 'host'), (address) => {
                return new MasterInstance(address, 'providers', timestampProviders.cellTag);
            }),
            cellTag: timestampProviders.cellTag,
        },
        discovery: {
            instances: _.map(_.sortBy(discoveryServers.addresses, 'host'), (address) => {
                return new MasterInstance(address, 'discovery', discoveryServers.cellTag);
            }),
            cellTag: discoveryServers.cellTag,
        },
        queueAgents: {
            instances: _.map(_.sortBy(queueAgents.addresses, 'host'), (address) => {
                return new MasterInstance(address, 'queue_agent');
            }),
        },
    };
    return state.masterData ? processMastersData(res, state.masterData) : res;
}

export interface MasterDataResponse {
    data: Array<BatchResultsItem<MasterDataItem>>;
    masterInfo: Array<MasterDataItemInfo>;
}

export interface MasterDataItem {
    state:
        | 'stopped'
        | 'unknown'
        | 'elections'
        | 'follower_recovery'
        | 'leader_recovery'
        | 'following'
        | 'leading';
}

export interface MasterDataItemInfo {
    host: string;
    type: string;
    cellTag: number;
}

function processMastersData(
    state: Pick<MastersState, 'primary' | 'secondary' | 'providers' | 'discovery' | 'queueAgents'>,
    {data: rawData, masterInfo}: MasterDataResponse,
) {
    const data = _.map(rawData, (payload) => payload.output);

    const masterToDataIndex: Record<string, number> = {};
    for (let i = 0; i < masterInfo.length; i++) {
        const {host, type, cellTag} = masterInfo[i];
        masterToDataIndex[type + cellTag + host] = i;
    }

    const primaryInstances = _.map(state.primary.instances, (instance) => {
        const {host, type, cellTag} = instance.toObject();
        const key = type + cellTag + host;
        return instance.clone().update(data[masterToDataIndex[key]]);
    });

    const primary: Required<MasterGroupData> = {
        instances: _.orderBy(primaryInstances, (instance) => instance.$address),
        cellTag: state.primary.cellTag!,
        quorum: getQuorum(primaryInstances),
        leader: getLeader(primaryInstances),
    };

    const secondary = _.map(state.secondary, (master) => {
        const instances = _.map(master.instances, (instance) => {
            const {host, type, cellTag} = instance.toObject();
            const key = type + cellTag + host;
            return instance.clone().update(data[masterToDataIndex[key]]);
        });
        const res: Required<MasterGroupData> = {
            instances: _.orderBy(instances, (instance) => instance.$address),
            cellTag: master.cellTag!,
            quorum: getQuorum(instances),
            leader: getLeader(instances),
        };
        return res;
    });

    const providersInstances = _.map(state.providers.instances, (instance) => {
        const {host, type, cellTag} = instance.toObject();
        const key = type + cellTag + host;
        return instance.clone().update(data[masterToDataIndex[key]]);
    });

    const providers = {
        instances: _.orderBy(providersInstances, (instance) => instance.$address),
        cellTag: state.providers.cellTag,
        quorum: getQuorum(providersInstances),
        leader: getLeader(providersInstances),
    };

    const discoveryInstances = _.map(state.discovery.instances, (instance) => {
        return instance.clone().update({state: instance.$state});
    });

    const discovery = {
        instances: _.orderBy(discoveryInstances, (instance) => instance.$address),
        cellTag: state.providers.cellTag,
    };

    const queueAgentInstances = _.map(state.queueAgents.instances, (instance) => {
        return instance.clone().update({state: instance.$state});
    });

    const queueAgents = {
        instances: _.orderBy(queueAgentInstances, (instance) => instance.$address),
    };

    const statusCounts: MastersState['counters']['states'] = calculateStatusCounts(data);

    return {
        counters: extractMasterCounters(primary, secondary, statusCounts),
        primary,
        secondary,
        providers,
        discovery,
        queueAgents,
    };
}

function masters(state = initialState, action: MastersStateAction): MastersState {
    switch (action.type) {
        case FETCH_MASTER_CONFIG.REQUEST:
            return {...state, fetchingConfig: true};
        case FETCH_MASTER_CONFIG.SUCCESS:
            return {
                ...state,
                ...processMastersConfig(state, action.data),
                mastersDataConfig: action.data,
                fetchingConfig: false,
                initialized: true,
            };
        case FETCH_MASTER_DATA.REQUEST:
            return {...state, fetchingData: true};
        case FETCH_MASTER_DATA.SUCCESS:
            return {
                ...state,
                ...processMastersData(state, action.data),
                masterData: action.data,
                fetchingData: false,
            };
        case FETCH_MASTER_DATA.FAILURE:
            return {...state, fetchingData: false, error: action.data};
        case SET_MASTER_ALERTS:
            return {...state, alerts: action.data};
        default:
            return state;
    }
}

export type MastersStateAction =
    | Action<typeof FETCH_MASTER_CONFIG.REQUEST | typeof FETCH_MASTER_DATA.REQUEST>
    | ActionD<typeof FETCH_MASTER_CONFIG.SUCCESS, MastersConfigResponse>
    | ActionD<typeof FETCH_MASTER_DATA.SUCCESS, MasterDataResponse>
    | ActionD<typeof FETCH_MASTER_DATA.FAILURE, YTError>
    | ActionD<typeof SET_MASTER_ALERTS, MasterAlert[]>;

export default mergeStateOnClusterChange(initialState, {}, masters);

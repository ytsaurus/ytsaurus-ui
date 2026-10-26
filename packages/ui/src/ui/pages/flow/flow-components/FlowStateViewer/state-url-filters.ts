import type {FlowKeyColumn, FlowStateTarget} from '../../../../../shared/yt-types';
import type {FlowStateViewerUrlState} from '../../../../store/reducers/flow/filters';
import {isMalformedUrlParam} from '../../../../utils/url-mapping';
import {parseHeavyHitterStateSeed} from './heavy-hitters';
import {formatRawKeyDraft} from './state-key';
import {serializeRawStateValue} from './state-value-format';
import type {
    FlowHeavyHitterStateSeed,
    FlowStateFiltersValue,
    FlowStatePersistedFilters,
} from './types';

export type FlowStateViewerUrlFilters = Omit<FlowStateViewerUrlState, 'stateViewerHeavyHitterSeed'>;

export type FlowStateUrlRestore = {
    filters: Partial<FlowStateFiltersValue> | undefined;
    malformed: boolean;
    heavyHitterSeed: FlowHeavyHitterStateSeed | undefined;
};

export const EMPTY_STATE_VIEWER_URL_STATE: FlowStateViewerUrlState = {
    stateViewerComputation: '',
    stateViewerPartition: '',
    stateViewerTarget: '',
    stateViewerName: '',
    stateViewerKeyText: '',
    stateViewerHeavyHitterSeed: '',
};

const STATE_VIEWER_URL_TARGETS: ReadonlyArray<string> = [
    'all',
    'key_state',
    'partition_state',
    'external_key_state',
];

function isStateViewerUrlTarget(value: string): value is FlowStateTarget {
    return STATE_VIEWER_URL_TARGETS.includes(value);
}

function restoreUrlText(value: string): string | undefined {
    return value && !isMalformedUrlParam(value) ? value : undefined;
}

export function describeKeyText(
    filters: FlowStateFiltersValue,
    keyColumns: Array<FlowKeyColumn>,
): string {
    if (filters.keyText !== undefined) {
        return filters.keyText;
    }
    return keyColumns.length > 0
        ? formatRawKeyDraft(keyColumns, filters.keyValues)
        : serializeRawStateValue(filters.rawKey);
}

export function toPersistedStateFilters(
    filters: FlowStateFiltersValue,
    keyColumns: Array<FlowKeyColumn>,
): FlowStatePersistedFilters {
    return {
        computationId: filters.computationId,
        partitionId: filters.partitionId,
        target: filters.target,
        stateName: filters.stateName,
        keyText: describeKeyText(filters, keyColumns),
    };
}

export function toStateViewerUrlState(
    persisted: FlowStatePersistedFilters,
    {
        fixedComputationId,
        hasHeavyHitterSeed = false,
    }: {fixedComputationId?: string; hasHeavyHitterSeed?: boolean},
): FlowStateViewerUrlFilters {
    const urlFilters = {
        stateViewerComputation: fixedComputationId ? '' : (persisted.computationId ?? ''),
        stateViewerPartition: persisted.partitionId ?? '',
        stateViewerTarget: persisted.target === 'all' ? '' : persisted.target,
        stateViewerName: persisted.stateName ?? '',
        stateViewerKeyText: persisted.keyText,
    };
    const absentFormRestoresDefaults = !fixedComputationId || hasHeavyHitterSeed;
    const formLooksAbsent = Object.values(urlFilters).every((value) => value === '');
    return absentFormRestoresDefaults && formLooksAbsent
        ? {...urlFilters, stateViewerTarget: 'all'}
        : urlFilters;
}

export function serializeStateViewerUrlState(
    urlState: FlowStateViewerUrlState,
    {withSeed}: {withSeed: boolean},
): string {
    return JSON.stringify([
        withSeed ? '' : urlState.stateViewerComputation,
        urlState.stateViewerPartition,
        urlState.stateViewerTarget,
        urlState.stateViewerName,
        urlState.stateViewerKeyText,
        withSeed ? urlState.stateViewerHeavyHitterSeed : '',
    ]);
}

export function restoreStateViewerUrlState(
    urlState: FlowStateViewerUrlState,
    {withSeed}: {withSeed: boolean},
): FlowStateUrlRestore {
    const {
        stateViewerComputation,
        stateViewerPartition,
        stateViewerTarget,
        stateViewerName,
        stateViewerKeyText,
        stateViewerHeavyHitterSeed,
    } = urlState;
    const seedText = withSeed ? stateViewerHeavyHitterSeed : '';
    const computationText = withSeed ? '' : stateViewerComputation;
    const heavyHitterSeed =
        restoreUrlText(seedText) === undefined ? undefined : parseHeavyHitterStateSeed(seedText);
    const targetText = restoreUrlText(stateViewerTarget);
    const malformed =
        [
            computationText,
            stateViewerPartition,
            stateViewerTarget,
            stateViewerName,
            stateViewerKeyText,
            seedText,
        ].some(isMalformedUrlParam) ||
        (stateViewerTarget !== '' && !isStateViewerUrlTarget(stateViewerTarget)) ||
        (seedText !== '' && heavyHitterSeed === undefined);
    const computationId = restoreUrlText(computationText);
    const partitionId = restoreUrlText(stateViewerPartition);
    const stateName = restoreUrlText(stateViewerName);
    const keyText = restoreUrlText(stateViewerKeyText);
    const target =
        targetText !== undefined && isStateViewerUrlTarget(targetText) ? targetText : undefined;
    if (
        computationId === undefined &&
        partitionId === undefined &&
        stateName === undefined &&
        keyText === undefined &&
        target === undefined
    ) {
        return {filters: undefined, malformed, heavyHitterSeed};
    }
    return {
        filters: {
            computationId,
            partitionId,
            target: target ?? 'all',
            stateName,
            keyValues: {},
            rawKey: undefined,
            keyText,
        },
        malformed,
        heavyHitterSeed,
    };
}

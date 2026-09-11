import type {FlowStateFiltersValue, FlowStateNameInputMode} from './types';

import type {FlowStateTarget, FlowStaticSpec} from '../../../../../shared/yt-types';
import {
    getComputationGroupByColumns,
    getComputationKeyColumns,
    getComputationStateNames,
} from './state-schema';

export function seedStateFilters(
    fixedComputationId: string | undefined,
    initialFilters: Partial<FlowStateFiltersValue> | undefined,
): FlowStateFiltersValue {
    return {
        keyValues: {},
        target: 'all',
        ...initialFilters,
        computationId: fixedComputationId ?? initialFilters?.computationId,
    };
}

export function getAvailableStateTargets(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
): Record<FlowStateTarget, boolean> {
    if (!computationId) {
        return {all: true, key_state: true, partition_state: true, external_key_state: true};
    }
    return {
        all: true,
        key_state: getComputationKeyColumns(spec, computationId).length > 0,
        partition_state: getComputationGroupByColumns(spec, computationId).length > 0,
        external_key_state:
            getComputationStateNames(spec, computationId, 'external_key_state').length > 0,
    };
}

export function reconcileStateTarget(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
    target: FlowStateTarget,
): FlowStateTarget {
    return getAvailableStateTargets(spec, computationId)[target] ? target : 'all';
}

export function getStateNameInputMode(target: FlowStateTarget): FlowStateNameInputMode {
    if (target === 'external_key_state') {
        return 'declared-only';
    }
    return target === 'all' ? 'suggested' : 'free-form';
}

export function reconcileStateName(
    stateName: string | undefined,
    target: FlowStateTarget,
    declaredNames: Array<string>,
): string | undefined {
    if (!stateName || getStateNameInputMode(target) !== 'declared-only') {
        return stateName;
    }
    return declaredNames.includes(stateName) ? stateName : undefined;
}

export function getStateNameSelectItems(
    names: Array<string>,
    current: string | undefined,
): Array<string> {
    return current && !names.includes(current) ? [...names, current] : names;
}

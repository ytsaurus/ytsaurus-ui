import type {FlowStateNameInputMode} from './types';

import type {FlowStateTarget} from '../../../../../shared/yt-types';

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

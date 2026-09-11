import cloneDeep_ from 'lodash/cloneDeep';
import mergeWith_ from 'lodash/mergeWith';

import ypath from '../../common/thor/ypath';

export type OperationSpecPatchInput = Record<string, unknown>;
export type CumulativeOperationSpecPatch = Record<string, unknown>;

export type OperationSpecPatchItem = {
    path: string;
    value: unknown;
};

export type KnownOperationSpecPatchValues = {
    maxFailedJobCount?: number;
    taskJobCounts: Record<string, number | undefined>;
};

export const MAX_FAILED_JOB_COUNT_PATH = '/max_failed_job_count';

export function getTaskJobCountPath(taskName: string) {
    return `/tasks/${ypath.YPath.escapeSpecialCharacters(taskName)}/job_count`;
}

export function extractKnownOperationSpecPatchValues(
    patch: OperationSpecPatchInput,
    taskNames: string[],
): KnownOperationSpecPatchValues {
    const maxFailedJobCount = patch[MAX_FAILED_JOB_COUNT_PATH];

    return {
        maxFailedJobCount: typeof maxFailedJobCount === 'number' ? maxFailedJobCount : undefined,
        taskJobCounts: Object.fromEntries(
            taskNames.map((taskName) => {
                const value = patch[getTaskJobCountPath(taskName)];
                return [taskName, typeof value === 'number' ? value : undefined];
            }),
        ),
    };
}

export function mergeKnownOperationSpecPatchValues(
    patch: OperationSpecPatchInput,
    values: KnownOperationSpecPatchValues,
    taskNames: string[],
): OperationSpecPatchInput {
    const result = cloneDeep_(patch);
    const mergeKnownNumber = (path: string, value?: number) => {
        if (value !== undefined) {
            result[path] = value;
        } else if (typeof result[path] === 'number') {
            delete result[path];
        }
    };

    mergeKnownNumber(MAX_FAILED_JOB_COUNT_PATH, values.maxFailedJobCount);
    taskNames.forEach((taskName) => {
        mergeKnownNumber(getTaskJobCountPath(taskName), values.taskJobCounts[taskName]);
    });

    return result;
}

type MapLike = Record<string, unknown>;

function isTypedMap(value: unknown): value is MapLike & {$type: 'map'; $value: MapLike} {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    const map = value as MapLike;
    return map.$type === 'map' && Boolean(map.$value) && typeof map.$value === 'object';
}

function mergeSpecPatchValue(_targetValue: unknown, patchValue: unknown) {
    if (Array.isArray(patchValue)) {
        return cloneDeep_(patchValue);
    }

    if (
        patchValue &&
        typeof patchValue === 'object' &&
        '$type' in patchValue &&
        (patchValue as MapLike).$type !== 'map'
    ) {
        return cloneDeep_(patchValue);
    }

    return undefined;
}

export function operationSpecPatchToItems(
    patch: OperationSpecPatchInput,
): OperationSpecPatchItem[] {
    return Object.entries(patch).map(([path, value]) => ({path, value}));
}

export function applyOperationSpecPatch<T>(
    fullSpec: T,
    cumulativeSpecPatch?: CumulativeOperationSpecPatch,
): T {
    if (!cumulativeSpecPatch || Object.keys(cumulativeSpecPatch).length === 0) {
        return fullSpec;
    }

    const patch =
        !isTypedMap(fullSpec) && isTypedMap(cumulativeSpecPatch)
            ? cumulativeSpecPatch.$value
            : cumulativeSpecPatch;

    return mergeWith_(cloneDeep_(fullSpec), patch, mergeSpecPatchValue);
}

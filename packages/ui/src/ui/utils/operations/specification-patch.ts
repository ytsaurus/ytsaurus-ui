import cloneDeep_ from 'lodash/cloneDeep';
import mergeWith_ from 'lodash/mergeWith';

export type OperationSpecPatchInput = Record<string, unknown>;
export type CumulativeOperationSpecPatch = Record<string, unknown>;

export type OperationSpecPatchItem = {
    path: string;
    value: unknown;
};

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

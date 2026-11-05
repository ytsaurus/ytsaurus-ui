import isEqual_ from 'lodash/isEqual';
import {type QueryItem} from '../../types/query-tracker/api';
import {cleanupQueryAnnotations} from '../../types/query-tracker/query';

type Annotations = QueryItem['annotations'];

export function mergeQueryAnnotations({
    saved,
    previouslySaved,
    snapshot,
    current,
    patch,
}: {
    saved: Annotations;
    previouslySaved: Annotations;
    snapshot: Annotations;
    current: Annotations;
    patch: Annotations;
}): Annotations {
    const merged: Record<string, unknown> = cleanupQueryAnnotations(saved);
    const before: Record<string, unknown> = cleanupQueryAnnotations(snapshot);
    const local: Record<string, unknown> = cleanupQueryAnnotations(current);
    const baseline: Record<string, unknown> = cleanupQueryAnnotations(previouslySaved);

    for (const key of new Set([...Object.keys(baseline), ...Object.keys(local)])) {
        if (
            isEqual_(baseline[key], local[key]) &&
            Object.hasOwn(baseline, key) === Object.hasOwn(local, key)
        ) {
            continue;
        }

        const reference = Object.hasOwn(patch || {}, key) ? before : baseline;
        if (
            !isEqual_(reference[key], local[key]) ||
            Object.hasOwn(reference, key) !== Object.hasOwn(local, key)
        ) {
            if (Object.hasOwn(local, key)) {
                merged[key] = local[key];
            } else {
                delete merged[key];
            }
        }
    }

    return merged;
}

import {ValueOf} from '../../../@types/types';

export interface FieldTree<T = unknown> extends Record<string, FieldTree<T> | T> {}

export type FieldTreePredicate<T, R> = (path: Array<string>, tree?: FieldTree<T>, item?: T) => R;

export function fieldTreeForEach<T>(
    vertex: ValueOf<FieldTree<T>>,
    isT: (v: typeof vertex) => v is T,
    visitorCb: FieldTreePredicate<T, void>,
    path: Array<string> = [],
) {
    if (isT(vertex)) {
        visitorCb(path, undefined, vertex);
    } else {
        if (!vertex) {
            return;
        }
        if (path.length) {
            visitorCb(path, vertex, undefined);
        }
        Object.keys(vertex ?? {}).forEach((k) => {
            path.push(k);
            fieldTreeForEach(vertex[k], isT, visitorCb, path);
            path.pop();
        });
    }
}

export function filterFieldTree<T>(
    vertex: FieldTree<T>,
    isT: (v: FieldTree<T> | T) => v is T,
    predicate: FieldTreePredicate<T, boolean | undefined>,
    filterT?: (item: T) => T | undefined,
    path: Array<string> = [],
): FieldTree<T> | undefined {
    let empty = true;
    const res: typeof vertex = {};
    Object.keys(vertex).forEach((k) => {
        path.push(k);
        const item = vertex[k];
        if (isT(item)) {
            if (predicate(path, undefined, item)) {
                const tmp = filterT ? filterT(item) : item;
                if (tmp !== undefined) {
                    res[k] = tmp;
                    empty = false;
                }
            }
        } else if (predicate(path, item, undefined)) {
            const tmp = filterFieldTree(item, isT, predicate, filterT, path);
            if (tmp !== undefined) {
                res[k] = tmp;
                empty = false;
            }
        }

        path.pop();
    });
    return empty ? undefined : res;
}

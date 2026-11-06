import isEqual_ from 'lodash/isEqual';

import unipika from '../../common/thor/unipika';
import ypath from '../../common/thor/ypath';
import {type FlowDynamicSpecPatch, type Int64} from '../../../shared/yt-types';

export class UnsafeDynamicSpecVersionError extends Error {}

export function dynamicSpecHasComment(comment?: string): boolean {
    return typeof comment === 'string' && !/^[\s\u0085]*$/u.test(comment);
}

export function decodeDynamicSpecText(value: string): string {
    if (Array.from(value).some((char) => char.charCodeAt(0) > 0xff)) {
        return value;
    }
    try {
        return unipika.utils.utf8.decode(value);
    } catch {
        return value;
    }
}

export function decodeDynamicSpecValue(value: unknown): unknown {
    if (typeof value === 'string') {
        return decodeDynamicSpecText(value);
    }
    if (Array.isArray(value)) {
        return value.map(decodeDynamicSpecValue);
    }
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, child]) => [
                decodeDynamicSpecText(key),
                decodeDynamicSpecValue(child),
            ]),
        );
    }
    return value;
}

export function encodeDynamicSpecValue(value: unknown, original: unknown): unknown {
    if (isEqual_(value, decodeDynamicSpecValue(original))) {
        return original;
    }
    if (typeof value === 'string') {
        return unipika.utils.utf8.encode(value);
    }
    if (Array.isArray(value)) {
        return value.map((child, index) =>
            encodeDynamicSpecValue(child, Array.isArray(original) ? original[index] : undefined),
        );
    }
    if (value !== null && typeof value === 'object') {
        const originalMap =
            original !== null && typeof original === 'object' && !Array.isArray(original)
                ? (original as Record<string, unknown>)
                : {};
        return Object.fromEntries(
            Object.entries(value).map(([key, child]) => {
                const originalKey = Object.keys(originalMap).find(
                    (rawKey) => decodeDynamicSpecText(rawKey) === key,
                );
                return [
                    originalKey ?? unipika.utils.utf8.encode(key),
                    encodeDynamicSpecValue(
                        child,
                        originalKey === undefined ? undefined : originalMap[originalKey],
                    ),
                ];
            }),
        );
    }
    return value;
}

export function dynamicSpecPath(path: Array<string>): string {
    return path.length
        ? '/' + path.map((key) => ypath.YPath.escapeSpecialCharacters(key)).join('/')
        : '';
}

export function dynamicSpecPathParts(path: string): Array<string> {
    return ypath.YPath.parseRelative(path).map(({name}: {name: string}) =>
        ypath.YPath.fragmentToYSON(name),
    );
}

export type DynamicSpecEdit = {path: Array<string>; value: unknown};

export function dynamicSpecPatchDiff(patch: FlowDynamicSpecPatch): Record<string, unknown> {
    const changes = patch.changes;
    const diff: Record<string, unknown> = Object.create(null);
    for (const {path, value} of changes) {
        const parts = dynamicSpecPathParts(path);
        let node = diff;
        for (const key of parts.slice(0, -1)) {
            node[key] = Object.assign(Object.create(null), mapValue(node[key]));
            node = node[key] as Record<string, unknown>;
        }
        if (parts.length) {
            node[parts[parts.length - 1]] = value;
        }
    }
    return diff;
}

export function dynamicSpecPatchChangesFromDiff(
    patch: FlowDynamicSpecPatch,
    diff: unknown,
): Array<DynamicSpecEdit> {
    const originalChanges = patch.changes;
    const originalPaths = new Set(
        originalChanges.map(({path}) => dynamicSpecPath(dynamicSpecPathParts(path))),
    );
    const changes: Array<DynamicSpecEdit> = [];
    const visit = (value: unknown, path: Array<string>) => {
        const map = mapValue(value);
        if (
            path.length &&
            (originalPaths.has(dynamicSpecPath(path)) || !map || !Object.keys(map).length)
        ) {
            changes.push({path, value});
            return;
        }
        for (const [key, child] of Object.entries(map ?? {})) {
            visit(child, [...path, key]);
        }
    };
    if (mapValue(diff)) {
        visit(diff, []);
    }
    return changes;
}

export function dynamicSpecVersion(version: Int64): string {
    if (typeof version === 'number' && !Number.isSafeInteger(version)) {
        throw new UnsafeDynamicSpecVersionError();
    }
    return typeof version === 'object' ? version.$value : String(version);
}

function mapValue(value: unknown): Record<string, unknown> | undefined {
    return value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !('$type' in value)
        ? (value as Record<string, unknown>)
        : undefined;
}

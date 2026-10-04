import isEqual_ from 'lodash/isEqual';

import unipika from '../../common/thor/unipika';
import ypath from '../../common/thor/ypath';
import {
    type FlowDynamicSpecAudit,
    type FlowDynamicSpecOverride,
    type FlowDynamicSpecSnapshot,
    type Int64,
} from '../../../shared/yt-types';

export type DynamicSpecSource =
    | {source: 'base' | 'default' | 'runtime'}
    | {source: 'override'; version: string; audit?: FlowDynamicSpecAudit};

export type DynamicSpecOverrideRow = {
    path: Array<string>;
    operation: FlowDynamicSpecOverride['operation'] | 'mask';
    value?: unknown;
    source: DynamicSpecSource;
    editorValue?: unknown;
    hasInheritedFields?: boolean;
};

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

export function decodeDynamicSpecAudit(state: FlowDynamicSpecSnapshot): FlowDynamicSpecSnapshot {
    return {
        ...state,
        audit: state.audit.map((record) => {
            return typeof record.comment === 'string'
                ? {...record, comment: decodeDynamicSpecText(record.comment)}
                : record;
        }),
    };
}

export function dynamicSpecPath(path: Array<string>): string {
    return path.length
        ? '/' + path.map((key) => ypath.YPath.escapeSpecialCharacters(key)).join('/')
        : '';
}

export function dynamicSpecValue(spec: unknown, path: Array<string>): unknown {
    return path.reduce<unknown>((value, key) => {
        const map = mapValue(value);
        return map && Object.hasOwn(map, key) ? map[key] : undefined;
    }, spec);
}

export type DynamicSpecEdit = {path: Array<string>; value: unknown};

export function dynamicSpecEdits(before: unknown, after: unknown): Array<DynamicSpecEdit> {
    const edits: Array<DynamicSpecEdit> = [];
    const visit = (left: unknown, right: unknown, path: Array<string>) => {
        if (isEqual_(left, right)) {
            return;
        }
        const leftMap = mapValue(left);
        const rightMap = mapValue(right);
        if (leftMap && rightMap) {
            for (const key of new Set([...Object.keys(leftMap), ...Object.keys(rightMap)])) {
                visit(
                    Object.hasOwn(leftMap, key) ? leftMap[key] : undefined,
                    Object.hasOwn(rightMap, key) ? rightMap[key] : undefined,
                    [...path, key],
                );
            }
        } else {
            edits.push({path, value: right});
        }
    };
    visit(before, after, []);
    return edits;
}

export function dynamicSpecVersion(version: Int64): string {
    if (typeof version === 'number' && !Number.isSafeInteger(version)) {
        throw new UnsafeDynamicSpecVersionError();
    }
    return typeof version === 'object' ? version.$value : String(version);
}

export function validateDynamicSpecVersions(state: FlowDynamicSpecSnapshot) {
    dynamicSpecVersion(state.version);
    state.audit.forEach(({version}) => dynamicSpecVersion(version));
    const visit = (node: FlowDynamicSpecOverride) => {
        if (node.version !== undefined && node.version !== null) {
            dynamicSpecVersion(node.version);
        }
        Object.values(node.children ?? {}).forEach(visit);
    };
    visit(state.override_spec);
}

function mapValue(value: unknown): Record<string, unknown> | undefined {
    return value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !('$type' in value)
        ? (value as Record<string, unknown>)
        : undefined;
}

function baseValue(state: FlowDynamicSpecSnapshot, path: Array<string>): unknown {
    return path.reduce<unknown>((value, key) => {
        return value !== null && typeof value === 'object' && Object.hasOwn(value, key)
            ? (value as Record<string, unknown>)[key]
            : undefined;
    }, state.base_spec);
}

function ownedSource(state: FlowDynamicSpecSnapshot, version: Int64): DynamicSpecSource {
    const id = dynamicSpecVersion(version);
    return {
        source: 'override',
        version: id,
        audit: state.audit.find((record) => dynamicSpecVersion(record.version) === id),
    };
}

export function dynamicSpecSource(
    state: FlowDynamicSpecSnapshot,
    path: Array<string>,
): DynamicSpecSource {
    if (
        path[0] === 'target_state' &&
        state.runtime_target_state !== undefined &&
        state.runtime_target_state !== null
    ) {
        return {source: 'runtime'};
    }
    let node: FlowDynamicSpecOverride | undefined = state.override_spec;
    for (let depth = 0; node; ++depth) {
        if (node.operation === 'inherit') {
            break;
        }
        const version = node.version;
        const owned = version !== undefined && version !== null;
        if (node.operation !== 'map' || depth === path.length) {
            return owned ? ownedSource(state, version) : {source: 'base'};
        }
        const children: Record<string, FlowDynamicSpecOverride> = node.children ?? {};
        const child: FlowDynamicSpecOverride | undefined = Object.hasOwn(children, path[depth])
            ? children[path[depth]]
            : undefined;
        if (!child && owned) {
            return ownedSource(state, version);
        }
        node = child;
    }
    return {source: baseValue(state, path) === undefined ? 'default' : 'base'};
}

export function dynamicSpecEffectiveSource(
    state: FlowDynamicSpecSnapshot,
    path: Array<string>,
): DynamicSpecSource {
    const source = dynamicSpecSource(state, path);
    if (source.source !== 'override') {
        return source;
    }
    let node: FlowDynamicSpecOverride | undefined = state.override_spec;
    for (let depth = 0; node?.operation === 'map' && depth < path.length; ++depth) {
        const children: Record<string, FlowDynamicSpecOverride> = node.children ?? {};
        const child: FlowDynamicSpecOverride | undefined = Object.hasOwn(children, path[depth])
            ? children[path[depth]]
            : undefined;
        if (!child) {
            const rawValue = path.slice(depth).reduce<unknown>((value, key) => {
                return value !== null && typeof value === 'object' && Object.hasOwn(value, key)
                    ? (value as Record<string, unknown>)[key]
                    : undefined;
            }, node.value);
            // Typed normalization adds defaults which are not part of the replacement patch.
            return rawValue !== undefined || baseValue(state, path) !== undefined
                ? source
                : {source: 'default'};
        }
        node = child;
    }
    return source;
}

function overrideLiteral(
    node: FlowDynamicSpecOverride,
    owner?: string,
): {
    present: boolean;
    value?: unknown;
    hasInheritedFields: boolean;
} {
    if (node.operation === 'inherit') {
        return {present: false, hasInheritedFields: true};
    }
    if (
        node.operation === 'remove' ||
        (owner !== undefined &&
            node.version !== undefined &&
            node.version !== null &&
            dynamicSpecVersion(node.version) !== owner)
    ) {
        return {present: false, hasInheritedFields: false};
    }
    if (node.operation === 'set') {
        return {present: true, value: node.value, hasInheritedFields: false};
    }
    const seed = mapValue(node.value);
    const entries = new Map(Object.entries(seed ?? {}));
    let hasInheritedFields = false;
    for (const [key, child] of Object.entries(node.children ?? {})) {
        const literal = overrideLiteral(child, owner);
        hasInheritedFields ||= literal.hasInheritedFields;
        if (literal.present) {
            entries.set(key, literal.value);
        } else {
            entries.delete(key);
        }
    }
    return {
        present: seed !== undefined || entries.size > 0,
        value: Object.fromEntries(entries),
        hasInheritedFields,
    };
}

export function dynamicSpecOverrideEditor(state: FlowDynamicSpecSnapshot, path: Array<string>) {
    let node = state.override_spec;
    for (const key of path) {
        const children = node.children ?? {};
        if (node.operation !== 'map' || !Object.hasOwn(children, key)) {
            return undefined;
        }
        node = children[key];
    }
    if (node.version === undefined || node.version === null || node.operation !== 'map') {
        return undefined;
    }
    const literal = overrideLiteral(node);
    return {
        value: literal.present ? literal.value : undefined,
        hasInheritedFields: literal.hasInheritedFields,
    };
}

export function dynamicSpecOverrideRows(state: FlowDynamicSpecSnapshot) {
    const rows: Array<DynamicSpecOverrideRow> = [];
    const visit = (
        node: FlowDynamicSpecOverride,
        path: Array<string>,
        base: unknown,
        hiddenOwner?: string,
    ) => {
        const version = node.version;
        const owned = version !== undefined && version !== null;
        const owner = owned ? dynamicSpecVersion(version) : undefined;
        if (node.operation !== 'map') {
            if (
                (owned || path.length) &&
                (hiddenOwner === undefined || owner !== hiddenOwner || node.operation === 'inherit')
            ) {
                rows.push({
                    path,
                    operation: node.operation,
                    value: node.operation === 'inherit' ? base : node.value,
                    source: dynamicSpecSource(state, path),
                });
            }
            return;
        }
        const compact = owned && mapValue(node.value) !== undefined;
        if (owned && owner !== hiddenOwner) {
            const editor = overrideLiteral(node);
            rows.push({
                path,
                operation: node.value === undefined || node.value === null ? 'mask' : 'map',
                value: compact ? overrideLiteral(node, owner).value : (node.value ?? undefined),
                source: ownedSource(state, version),
                editorValue: editor.present ? editor.value : undefined,
                hasInheritedFields: editor.hasInheritedFields,
            });
        }
        const baseMap = mapValue(base) ?? {};
        const children = node.children ?? {};
        for (const key of Object.keys(children).sort()) {
            visit(
                children[key],
                [...path, key],
                Object.hasOwn(baseMap, key) ? baseMap[key] : undefined,
                compact ? owner : hiddenOwner,
            );
        }
    };
    visit(state.override_spec, [], state.base_spec);
    return rows;
}

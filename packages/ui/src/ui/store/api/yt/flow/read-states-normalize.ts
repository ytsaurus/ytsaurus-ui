import type {FlowAnnotatedInteger, FlowReadStatesResponse} from '../../../../../shared/yt-types';
import unipika from '../../../../common/thor/unipika';
import ypath from '../../../../common/thor/ypath';
import {isBigIntegerType} from './state-scalar-types';
export {BIG_INTEGER_RANGES, isBigIntegerType} from './state-scalar-types';

function isPlainObject(node: unknown): node is Record<string, unknown> {
    return typeof node === 'object' && node !== null && !Array.isArray(node);
}

export function isAnnotatedBigInteger(node: unknown): node is FlowAnnotatedInteger {
    return (
        isPlainObject(node) &&
        typeof node.$type === 'string' &&
        isBigIntegerType(node.$type) &&
        typeof node.$value === 'string'
    );
}

export function decodeYtString(value: string): string {
    if ([...value].some((character) => character.charCodeAt(0) > 0xff)) {
        return value;
    }
    try {
        return unipika.utils.utf8.decode(value);
    } catch {
        return value;
    }
}

function normalizeAnnotatedScalar(type: string, value: string): unknown {
    switch (type) {
        case 'int64':
        case 'uint64':
            return {$type: type, $value: value};
        case 'double':
            return Number(value);
        case 'boolean':
            return value === 'true';
        case 'string':
            return decodeYtString(value);
        default:
            return value;
    }
}

export function normalizeAnnotatedValue(node: unknown): unknown {
    if (Array.isArray(node)) {
        return node.map(normalizeAnnotatedValue);
    }
    if (!isPlainObject(node)) {
        return typeof node === 'string' ? decodeYtString(node) : node;
    }
    const rawValue: unknown = ypath.getValue(node);
    if (rawValue !== node) {
        const type = node.$type;
        const value =
            typeof type === 'string' && typeof rawValue === 'string'
                ? normalizeAnnotatedScalar(type, rawValue)
                : normalizeAnnotatedValue(rawValue);
        if (!('$attributes' in node)) {
            return value;
        }
        const attributes = normalizeAnnotatedValue(ypath.getAttributes(node));
        return isAnnotatedBigInteger(value)
            ? {$attributes: attributes, ...value}
            : {$attributes: attributes, $value: value};
    }
    return Object.fromEntries(
        Object.entries(node).map(([field, child]) => [
            decodeYtString(field),
            normalizeAnnotatedValue(child),
        ]),
    );
}

export function normalizeReadStatesResponse(response: unknown): FlowReadStatesResponse {
    return normalizeAnnotatedValue(response) as FlowReadStatesResponse;
}

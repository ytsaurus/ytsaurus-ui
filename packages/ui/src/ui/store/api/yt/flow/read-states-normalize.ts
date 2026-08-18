import type {FlowAnnotatedInteger, FlowReadStatesResponse} from '../../../../../shared/yt-types';

export const BIG_INTEGER_RANGES = {
    int64: {min: BigInt('-9223372036854775808'), max: BigInt('9223372036854775807')},
    uint64: {min: BigInt('0'), max: BigInt('18446744073709551615')},
};

export function isBigIntegerType(type: string): type is keyof typeof BIG_INTEGER_RANGES {
    return type === 'int64' || type === 'uint64';
}

function isPlainObject(node: unknown): node is Record<string, unknown> {
    return typeof node === 'object' && node !== null && !Array.isArray(node);
}

export function isAnnotatedBigInteger(node: unknown): node is FlowAnnotatedInteger {
    return (
        isPlainObject(node) &&
        (node.$type === 'int64' || node.$type === 'uint64') &&
        typeof node.$value === 'string'
    );
}

const MIN_SAFE_BIG = BigInt(Number.MIN_SAFE_INTEGER);
const MAX_SAFE_BIG = BigInt(Number.MAX_SAFE_INTEGER);

function parseBigIntegerInRange(
    type: keyof typeof BIG_INTEGER_RANGES,
    value: string,
): bigint | undefined {
    const pattern = type === 'uint64' ? /^\d+$/ : /^-?\d+$/;
    if (!pattern.test(value)) {
        return undefined;
    }
    const parsed = BigInt(value);
    const range = BIG_INTEGER_RANGES[type];
    return parsed < range.min || parsed > range.max ? undefined : parsed;
}

function normalizeAnnotatedScalar(type: string, value: string): unknown {
    switch (type) {
        case 'int64':
        case 'uint64': {
            const parsed = parseBigIntegerInRange(type, value);
            if (parsed === undefined) {
                return {$type: type, $value: value};
            }
            return parsed >= MIN_SAFE_BIG && parsed <= MAX_SAFE_BIG
                ? Number(parsed)
                : {$type: type, $value: value};
        }
        case 'double':
            return Number(value);
        case 'boolean':
            return value === 'true';
        default:
            return value;
    }
}

const ANNOTATION_KEYS = new Set(['$type', '$value', '$attributes']);

export function normalizeAnnotatedValue(node: unknown): unknown {
    if (Array.isArray(node)) {
        return node.map(normalizeAnnotatedValue);
    }
    if (!isPlainObject(node)) {
        return node;
    }
    const nodeKeys = Object.keys(node);
    const isAnnotationWrapper =
        nodeKeys.length > 0 && nodeKeys.every((key) => ANNOTATION_KEYS.has(key));
    if (isAnnotationWrapper) {
        const type = node.$type;
        const rawValue = node.$value;
        const value =
            typeof type === 'string' && typeof rawValue === 'string'
                ? normalizeAnnotatedScalar(type, rawValue)
                : normalizeAnnotatedValue(rawValue);
        if (!('$attributes' in node)) {
            return value;
        }
        const attributes = normalizeAnnotatedValue(node.$attributes);
        return isAnnotatedBigInteger(value)
            ? {$attributes: attributes, ...value}
            : {$attributes: attributes, $value: value};
    }
    return Object.fromEntries(
        Object.entries(node).map(([field, child]) => [field, normalizeAnnotatedValue(child)]),
    );
}

export function normalizeReadStatesResponse(response: unknown): FlowReadStatesResponse {
    return normalizeAnnotatedValue(response) as FlowReadStatesResponse;
}

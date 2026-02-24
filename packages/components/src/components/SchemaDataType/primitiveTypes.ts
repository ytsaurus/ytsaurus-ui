const NAMES = [
    'Void',
    'Yson',
    'Json',
    'Null',
    'Double',
    'Float',
    'Int64',
    'Int32',
    'Int16',
    'Int8',
    'Uint64',
    'Uint32',
    'Uint16',
    'Uint8',
    'Date',
    'TzDate',
    'Datetime',
    'TzDatetime',
    'Timestamp',
    'TzTimestamp',
    'Interval',
    'String',
    'Utf8',
    'Bool',
    'Raw',
    'Uuid',
    'Dynumber',
] as const;

const withLowerCase = new Set<string>(NAMES);
NAMES.forEach((n) => withLowerCase.add(n.toLowerCase()));
export const DEFAULT_PRIMITIVE_TYPES = withLowerCase;

export function toPrimitiveTypesSet(value: Set<string> | string[] | undefined): Set<string> {
    if (value === undefined) {
        return DEFAULT_PRIMITIVE_TYPES;
    }
    return value instanceof Set ? value : new Set(value);
}

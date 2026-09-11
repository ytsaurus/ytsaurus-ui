export const INTEGER_RANGES: Record<string, {min: number; max: number}> = {
    int8: {min: -128, max: 127},
    int16: {min: -32768, max: 32767},
    int32: {min: -2147483648, max: 2147483647},
    uint8: {min: 0, max: 255},
    uint16: {min: 0, max: 65535},
    uint32: {min: 0, max: 4294967295},
};

export const BIG_INTEGER_RANGES = {
    int64: {min: BigInt('-9223372036854775808'), max: BigInt('9223372036854775807')},
    uint64: {min: BigInt('0'), max: BigInt('18446744073709551615')},
};

export function isBigIntegerType(type: string): type is keyof typeof BIG_INTEGER_RANGES {
    return type === 'int64' || type === 'uint64';
}

export function getScalarKind(type: string) {
    switch (type) {
        case 'int8':
        case 'int16':
        case 'int32':
        case 'int64':
            return 'signed-integer';
        case 'uint8':
        case 'uint16':
        case 'uint32':
        case 'uint64':
            return 'unsigned-integer';
        case 'double':
        case 'float':
            return 'number';
        case 'boolean':
        case 'string':
            return type;
        default:
            return undefined;
    }
}

export const SIGNED_INTEGER_PATTERN = /^-?(?:0|[1-9][0-9]*)$/;
export const UNSIGNED_INTEGER_PATTERN = /^(?:0|[1-9][0-9]*)u$/;
export const FINITE_NUMBER_PATTERN =
    /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?(?:0|[1-9][0-9]*))?$/;

/**
 * Validates a number against various constraints
 * @param constraints Object containing constraints: ge (>=), le (<=), gt (>), lt (<)
 * @param v The number to validate
 * @returns Error message if validation fails, undefined otherwise
 */
export function validateNumber(
    {
        ge,
        le,
        gt,
        lt,
        allowParse,
    }: {ge?: number; le?: number; lt?: number; gt?: number; allowParse?: boolean},
    value?: number | string,
): string | undefined {
    const v = valueOrParsed(value, allowParse);

    if (v === undefined || !Number.isFinite(v)) {
        return 'Incorrect value';
    }

    if (ge !== undefined && !(v >= ge)) {
        return `The value must be \u2265 ${ge}`;
    }

    if (le !== undefined && !(v <= le)) {
        return `The value must be \u2264 ${le}`;
    }

    if (gt !== undefined && !(v > gt)) {
        return `The value must be > ${gt}`;
    }

    if (lt !== undefined && !(v < lt)) {
        return `The value must be < ${lt}`;
    }

    return undefined;
}

function valueOrParsed(v?: number | string, allowParse?: boolean): number {
    if (Number.isFinite(v) || !allowParse) {
        return v as number;
    }

    if (v === null || v === '') {
        return NaN;
    } else {
        return Number(v);
    }
}

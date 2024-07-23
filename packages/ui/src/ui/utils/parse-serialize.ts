import {EMPTY_ARRAY} from '../constants/empty';

import indexOf_ from 'lodash/indexOf';
import isEqual_ from 'lodash/isEqual';
import join_ from 'lodash/join';
import reduce_ from 'lodash/reduce';
import split_ from 'lodash/split';

type ParseSerialize<T> = {
    [K in keyof T]: Serialization<T[K]>;
};

export type Serialization<T> = {
    parse(v: string): T;
    serialize(v: T): string | undefined;
};

export const parseSerializeNumber: Serialization<number> = {
    parse: (v: string) => Number(v),
    serialize: (v: Number) => `${v}`,
};

export const parseSerializeString: Serialization<string> = {
    parse: (v: string) => v,
    serialize: (v: string) => v,
};

export const parseSerializeBoolean: Serialization<boolean> = {
    parse: (v: string) => v === 'true',
    serialize: (v: boolean) => (v ? `${v}` : ''),
};

export function parseSerializeSymbolCreate<K extends string>(): Serialization<K> {
    return parseSerializeString as any;
}

export const parseSerializeArrayString: Serialization<Array<string>> = {
    parse(v: string) {
        const res = split_(v, '|');
        return !res.length ? EMPTY_ARRAY : res;
    },
    serialize(v: Array<string>) {
        if (!v?.length) {
            return undefined;
        }
        return join_(v, '|');
    },
};

export interface TimeRangeType {
    shortcutValue?: string;
    from?: number;
    to?: number;
}

export function makeTimeRangeSerialization(initialValue: TimeRangeType) {
    return wrapTimeSerialization(
        makeObjectParseSerialize(initialValue, {
            from: parseSerializeNumber,
            to: parseSerializeNumber,
            shortcutValue: parseSerializeString,
        }),
    );
}

export function makeTimeRangeMsToSecondsSerialization(initialValueMs: TimeRangeType) {
    return wrapTimeSerialization(makeTimeRangeSerialization(initialValueMs), {
        parse: (seconds) => seconds * 1000,
        serialize: (ms) => Math.round(ms / 1000),
    });
}

function wrapTimeSerialization<T extends TimeRangeType>(
    {parse, serialize}: Serialization<T>,
    adjust: {
        parse: (v: number) => number;
        serialize: (v: number) => number;
    } = {
        parse: (v) => v,
        serialize: (v) => v,
    },
) {
    return {
        serialize(v: T) {
            const {from, to, ...rest} = v || {};
            return serialize({
                ...rest,
                from: from ? adjust.serialize(from) : from,
                to: to ? adjust.serialize(to) : to,
            } as T);
        },
        parse(input: string) {
            const res = parse(input);
            const {from, to, shortcutValue} = res;
            return from! > 0 && to! > 0
                ? {from: adjust.parse(from!), to: adjust.parse(to!)}
                : {shortcutValue};
        },
    };
}

export function parseSerializeSymbolArrayCreate<K extends string>(): Serialization<K> {
    return parseSerializeArrayString as any;
}

export function makeObjectParseSerialize<T extends object>(initialValue: T, io: ParseSerialize<T>) {
    return {
        parse(v = '') {
            const parts = split_(v, ',');
            const res = reduce_(
                parts,
                (acc, item) => {
                    const nameEnd = indexOf_(item, '-');
                    if (nameEnd === -1) {
                        return acc;
                    }
                    const name = item.slice(0, nameEnd) as keyof T;
                    const valueStr = item.slice(nameEnd + 1);
                    if (!valueStr) {
                        return acc;
                    }

                    const {parse} = io[name];
                    if (parse) {
                        acc[name] = parse(valueStr);
                    }
                    return acc;
                },
                {...initialValue},
            );
            return res;
        },
        serialize(obj: T) {
            const res = reduce_(
                obj,
                (acc, v, key) => {
                    const k = key as keyof T;
                    if (isEqual_(initialValue[k], v)) {
                        return acc;
                    }

                    const {serialize} = io[k];
                    if (serialize) {
                        acc += `${acc.length ? ',' : ''}${key}-${serialize(v)}`;
                    }
                    return acc;
                },
                '',
            );
            return res || undefined;
        },
    };
}

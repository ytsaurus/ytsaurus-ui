import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';

import {EMPTY_ARRAY} from '../constants/empty';
import {type SortState} from '../types';

const TO_ENCODE: Record<string, string> = {
    '=': encodeURIComponent('='),
    '%': encodeURIComponent('%'),
    '&': encodeURIComponent('&'),
    '#': encodeURIComponent('#'),
    ' ': encodeURIComponent(' '),
    '+': encodeURIComponent('+'),
};

const TO_ENCODE_WITH_DASH = {
    ...TO_ENCODE,
    '-': '%2D',
};

export function customEncodeURIComponent(value: string, toEncode = TO_ENCODE) {
    let res = '';
    try {
        for (const c of value) {
            const encoded = toEncode[c];
            if (encoded) {
                res += encoded;
            } else {
                res += encodeURI(c);
            }
        }
    } catch (e) {
        // emoji fix
        return encodeURI(value);
    }
    return res;
}

export const MALFORMED_URL_PARAM_PREFIX = '\u0000';

export function safeDecodeURIComponent(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return `${MALFORMED_URL_PARAM_PREFIX}${value}`;
    }
}

export function isMalformedUrlParam(value: string): boolean {
    return value.startsWith(MALFORMED_URL_PARAM_PREFIX);
}

const LEGACY_PLUS_AS_SPACE_PARAMS: ReadonlyArray<string> = ['heavyHitterSeed'];

export function splitQueryParam(queryParam: string): Array<string> {
    const split = queryParam.split('=');
    if (LEGACY_PLUS_AS_SPACE_PARAMS.includes(split[0]) && split[1] !== undefined) {
        split[1] = split[1].replace(/\+/g, '%20');
    }
    return split;
}

export function parseSortStateArray(s: string) {
    const res: Array<SortState> = [];

    const parts = s.split(',');
    forEach_(parts, (p) => {
        try {
            const [columnEncoded, orderEncoded] = p.split('-');
            const column = decodeURIComponent(columnEncoded);
            const order = decodeURIComponent(orderEncoded) as SortState['order'];

            if (column && order) {
                res.push({column, order});
            }
        } catch (e) {}
    });

    return res.length ? res : EMPTY_ARRAY;
}

export function serializeSortStateArray(value: Array<SortState>) {
    const items = map_(value, ({column, order}) => {
        if (!column || !order) {
            return '';
        }

        const columnEncoded = customEncodeURIComponent(column, TO_ENCODE_WITH_DASH);
        const orderEncoded = customEncodeURIComponent(order, TO_ENCODE_WITH_DASH);

        return `${columnEncoded}-${orderEncoded}`;
    });

    const res = items.filter(Boolean).join(',');
    return res.length ? res : undefined;
}

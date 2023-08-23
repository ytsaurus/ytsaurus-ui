import _ from 'lodash';
import {SortState} from '../types';

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
    for (let i = 0; i < value.length; ++i) {
        const c = value[i];
        const encoded = toEncode[c];
        if (encoded) {
            res += encoded;
        } else {
            res += encodeURI(c);
        }
    }
    return res;
}

export function parseSortStateArray(s: string) {
    const res: Array<SortState> = [];

    const parts = s.split(',');
    _.forEach(parts, (p) => {
        try {
            const [columnEncoded, orderEncoded] = p.split('-');
            const column = decodeURIComponent(columnEncoded);
            const order = decodeURIComponent(orderEncoded) as SortState['order'];

            if (column && order) {
                res.push({column, order});
            }
        } catch (e) {}
    });

    return res;
}

export function serializeSortStateArray(value: Array<SortState>) {
    const items = _.map(value, ({column, order}) => {
        if (!column || !order) {
            return '';
        }

        const columnEncoded = customEncodeURIComponent(column, TO_ENCODE_WITH_DASH);
        const orderEncoded = customEncodeURIComponent(order, TO_ENCODE_WITH_DASH);

        return `${columnEncoded}-${orderEncoded}`;
    });

    return items.filter(Boolean).join(',');
}

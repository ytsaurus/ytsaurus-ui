import {freeze} from 'immer';
import {type TypeArray} from '@ytsaurus/components';

import {Query} from './query';
import unipika from '../../../../common/thor/unipika';

// Use the real formatter without the application's implicit Redux settings.
jest.mock('../../../../common/thor/unipika', () =>
    jest.requireActual('@gravity-ui/unipika/lib/unipika'),
);

const yqlTypes: TypeArray[] = [['OptionalType', ['DataType', 'Yson']]];

describe('Query.prepareColumnValue with YSON keys', () => {
    it.each([
        {key: ['queue', 7], expected: '["queue";7]'},
        {key: {partition: 7}, expected: '{"partition"\u00a0=\u00a07}'},
        {key: ['queue', [7, 42]], expected: '["queue";[7;42]]'},
    ])('formats a frozen $key without changing it', ({key, expected}) => {
        const value = freeze([[key], 0], true);

        expect(Query.prepareColumnValue(value, yqlTypes)).toBe(expected);
        expect(Query.prepareColumnValue(value, yqlTypes)).toBe(expected);
    });

    it('keeps the input unchanged before it is frozen by a later state update', () => {
        const key = ['queue', [7, 42]];
        const value = [[key], 0];

        expect(Query.prepareColumnValue(value, yqlTypes)).toBe('["queue";[7;42]]');
        expect(Object.getOwnPropertySymbols(key)).toEqual([]);
        expect(Object.getOwnPropertySymbols(key[1])).toEqual([]);
        expect(Object.getOwnPropertySymbols(value[0])).toEqual([]);

        freeze(value, true);

        expect(Query.prepareColumnValue(value, yqlTypes)).toBe('["queue";[7;42]]');
    });

    it('formats a key that was already rendered before it was frozen', () => {
        const key = ['queue', [7, 42]];
        const data = [key];
        unipika.formatFromYQL([data, yqlTypes[0]], {
            format: 'yson',
            asHTML: false,
            treatValAsData: true,
        });
        expect(Object.getOwnPropertySymbols(key[1]).map(String)).toContain('Symbol(parent)');

        const value = freeze([data, 0], true);

        expect(Query.prepareColumnValue(value, yqlTypes)).toBe('["queue";[7;42]]');
    });
});

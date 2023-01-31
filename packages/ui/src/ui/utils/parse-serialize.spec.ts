import {
    makeObjectParseSerialize,
    parseSerializeArrayString,
    parseSerializeString,
} from './parse-serialize';

describe('makeObjectToStringConvertor', () => {
    const initialValue = {
        mode: 'filter',
        filter: 'text',
        selected: ['apple', 'pear'],
    };

    const {serialize, parse} = makeObjectParseSerialize(initialValue, {
        mode: parseSerializeString,
        filter: parseSerializeString,
        selected: parseSerializeArrayString,
    });

    it('Test 0', () => {
        const example = {
            mode: 'filter',
            filter: 'text',
            selected: ['apple', 'pear'],
        };

        const s = serialize(example);
        expect(s).toBe(undefined);
        expect(parse(s)).toEqual(example);
    });

    it('Test 1', () => {
        const example = {mode: 'filter1', filter: 'text1', selected: ['apple1', 'pear1']};

        const s = serialize(example);
        expect(s).toBe('mode-filter1,filter-text1,selected-apple1|pear1');
        expect(parse(s)).toEqual(example);
    });

    it('Test 2', () => {
        const example = {mode: 'filter', filter: 'text1', selected: ['apple']};

        const s = serialize(example);
        expect(s).toBe('filter-text1,selected-apple');
        expect(parse(s)).toEqual(example);
    });
});

import {
    makeBase64ParseSerialize,
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

describe('makeBase64ParseSerialize', () => {
    it.each([{account: 'Веник'}, {emoji: '😀'}, {ключ: ['Веник', '😀', '\\u0430', '"', '\\']}])(
        'round-trips Unicode JSON %j',
        (value) => {
            const {parse, serialize} = makeBase64ParseSerialize(undefined);

            const encoded = serialize(value) ?? '';

            expect(JSON.parse(atob(encoded))).toEqual(value);
            expect(parse(encoded)).toEqual(value);
        },
    );

    it.each([
        {value: {account: 'alice'}, encoded: 'eyJhY2NvdW50IjoiYWxpY2UifQ=='},
        {value: {label: 'café'}, encoded: 'eyJsYWJlbCI6ImNhZukifQ=='},
    ])('preserves the existing Base64 encoding for $value', ({value, encoded}) => {
        const {parse, serialize} = makeBase64ParseSerialize(undefined);

        expect(serialize(value)).toBe(encoded);
        expect(parse(encoded)).toEqual(value);
    });

    it.each([{value: null}, {value: false}, {value: 0}, {value: ''}, {value: []}, {value: {}}])(
        'preserves JSON value $value when it is not the default',
        ({value}) => {
            const {parse, serialize} = makeBase64ParseSerialize(undefined);

            expect(parse(serialize(value) ?? '')).toEqual(value);
        },
    );

    it('omits undefined and structurally equal default values', () => {
        const {serialize} = makeBase64ParseSerialize({panels: [], params: {}});

        expect(serialize(undefined)).toBeUndefined();
        expect(serialize({panels: [], params: {}})).toBeUndefined();
    });

    it.each(['', '%%%', 'bm90IGpzb24='])(
        'falls back to the default for invalid input %j',
        (encoded) => {
            const initialValue = {panels: []};
            const {parse} = makeBase64ParseSerialize(initialValue);

            expect(parse(encoded)).toEqual(initialValue);
        },
    );
});

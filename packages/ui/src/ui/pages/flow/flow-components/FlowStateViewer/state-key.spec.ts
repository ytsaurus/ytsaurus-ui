import {castKeyValue, formatRawKeyDraft, parseRawKeyDraft} from './state-key';
import type {FlowKeyColumn} from '../../../../../shared/yt-types';

describe('raw key drafts', () => {
    const stringColumns: Array<FlowKeyColumn> = [
        {name: 'first', type: 'string'},
        {name: 'second', type: 'string'},
        {name: 'third', type: 'string'},
    ];

    it('accepts valid unquoted YSON string tokens without identifier restrictions', () => {
        expect(
            parseRawKeyDraft('[Веник с проволокой; 42/market@key; true]', stringColumns),
        ).toEqual({
            values: {first: 'Веник с проволокой', second: '42/market@key', third: 'true'},
        });
    });

    it('round-trips quoted and escaped UTF-8 key values', () => {
        const values = {
            first: 'Веник-И-"пленка"',
            second: 'строка;с-разделителем',
            third: 'обычная строка',
        };
        const raw = formatRawKeyDraft(stringColumns, values);

        expect(parseRawKeyDraft(raw, stringColumns)).toEqual({values});
    });

    it('accepts empty input and rejects partially empty keys', () => {
        expect(parseRawKeyDraft('', stringColumns)).toEqual({
            values: {first: '', second: '', third: ''},
        });
        expect(parseRawKeyDraft('[first; ; third]', stringColumns)).toEqual({
            error: {errorKey: 'validation_fill-all-keys'},
        });
    });

    it.each(['first; second; third', '[first; [second]; third]', '[first; {second}; third]'])(
        'rejects malformed or nested input %s',
        (raw) => {
            expect(parseRawKeyDraft(raw, stringColumns)).toEqual({
                error: {errorKey: 'validation_invalid-key-syntax'},
            });
        },
    );

    it('rejects the wrong arity', () => {
        expect(parseRawKeyDraft('[first; second]', stringColumns)).toEqual({
            error: {errorKey: 'validation_key-arity', params: {expected: '3'}},
        });
    });

    it.each([
        ['[42]', {name: 'key', type: 'int64'}, '42'],
        ['[42u]', {name: 'key', type: 'uint64'}, '42'],
        ['[1.5e2]', {name: 'key', type: 'double'}, '1.5e2'],
        ['[%true]', {name: 'key', type: 'boolean'}, 'true'],
    ] as const)('parses canonical token %s', (raw, column, value) => {
        expect(parseRawKeyDraft(raw, [column])).toEqual({values: {key: value}});
    });

    it.each([
        ['["42"]', 'int64'],
        ['[42]', 'uint64'],
        ['[true]', 'boolean'],
        ['[Infinity]', 'double'],
    ])('rejects noncanonical token %s for %s', (raw, type) => {
        expect(parseRawKeyDraft(raw, [{name: 'key', type}])).toEqual({
            error: {errorKey: 'validation_invalid-key-syntax'},
        });
    });

    it('treats a quoted empty string as present and validates it', () => {
        expect(parseRawKeyDraft('[""]', [{name: 'key', type: 'string'}])).toEqual({
            error: {errorKey: 'validation_empty-key-value', params: {name: 'key'}},
        });
    });
});
describe('castKeyValue', () => {
    it('casts small integers to numbers and 64-bit integers to annotated values', () => {
        expect(castKeyValue({name: 'k', type: 'int32'}, '42')).toEqual({value: 42});
        expect(castKeyValue({name: 'k', type: 'uint64'}, '42')).toEqual({
            value: {$type: 'uint64', $value: '42'},
        });
    });
    it('accepts a key past 2^53 without precision loss', () => {
        expect(castKeyValue({name: 'k', type: 'uint64'}, '9007199254740993')).toEqual({
            value: {$type: 'uint64', $value: '9007199254740993'},
        });
    });
    it('rejects non-integers with a translatable error identifier', () => {
        expect(castKeyValue({name: 'k', type: 'int64'}, 'abc')).toEqual({
            error: {errorKey: 'validation_expects-integer', params: {name: 'k', type: 'int64'}},
        });
    });
    it('keeps strings verbatim', () => {
        expect(castKeyValue({name: 'k', type: 'string'}, ' a b ')).toEqual({value: ' a b '});
    });
    it('casts booleans', () => {
        expect(castKeyValue({name: 'k', type: 'boolean'}, 'true')).toEqual({value: true});
    });
    it('rejects a negative value for unsigned integers', () => {
        expect(castKeyValue({name: 'k', type: 'uint64'}, '-1')).toHaveProperty('error');
    });
    it('keeps negatives for signed integers', () => {
        expect(castKeyValue({name: 'k', type: 'int32'}, '-1')).toEqual({value: -1});
        expect(castKeyValue({name: 'k', type: 'int64'}, '-1')).toEqual({
            value: {$type: 'int64', $value: '-1'},
        });
    });
    it('rejects non-numeric doubles', () => {
        expect(castKeyValue({name: 'k', type: 'double'}, 'abc')).toHaveProperty('error');
        expect(castKeyValue({name: 'k', type: 'float'}, 'abc')).toHaveProperty('error');
    });
    it('rejects empty input with a translatable error identifier', () => {
        expect(castKeyValue({name: 'k', type: 'uint64'}, '   ')).toEqual({
            error: {errorKey: 'validation_empty-key-value', params: {name: 'k'}},
        });
    });
    it('rejects an invalid boolean', () => {
        expect(castKeyValue({name: 'k', type: 'boolean'}, 'yes')).toHaveProperty('error');
    });
    it.each([
        ['int8', '127'],
        ['int8', '-128'],
        ['uint8', '255'],
        ['int16', '32767'],
        ['uint16', '65535'],
        ['int32', '2147483647'],
        ['int32', '-2147483648'],
        ['uint32', '4294967295'],
    ])('accepts %s in-range boundary %s', (type, raw) => {
        expect(castKeyValue({name: 'k', type}, raw)).toEqual({value: Number(raw)});
    });
    it.each([
        ['int8', '128'],
        ['int8', '-129'],
        ['uint8', '256'],
        ['int16', '32768'],
        ['uint16', '65536'],
        ['int32', '2147483648'],
        ['uint32', '4294967296'],
    ])('rejects %s just out of range %s', (type, raw) => {
        expect(castKeyValue({name: 'k', type}, raw)).toEqual({
            error: {errorKey: 'validation_integer-out-of-range', params: {name: 'k', type}},
        });
    });
    it.each([
        ['int64', '9223372036854775807'],
        ['int64', '-9223372036854775808'],
        ['uint64', '18446744073709551615'],
    ])('accepts the full %s range boundary %s', (type, raw) => {
        expect(castKeyValue({name: 'k', type}, raw)).toEqual({
            value: {$type: type, $value: raw},
        });
    });
    it.each([
        ['int64', '9223372036854775808'],
        ['int64', '-9223372036854775809'],
        ['uint64', '18446744073709551616'],
    ])('rejects %s just past the boundary %s', (type, raw) => {
        expect(castKeyValue({name: 'k', type}, raw)).toEqual({
            error: {errorKey: 'validation_integer-out-of-range', params: {name: 'k', type}},
        });
    });
    it('normalizes leading zeros in 64-bit keys', () => {
        expect(castKeyValue({name: 'k', type: 'uint64'}, '007')).toEqual({
            value: {$type: 'uint64', $value: '7'},
        });
    });
    it('rejects non-finite floats', () => {
        expect(castKeyValue({name: 'k', type: 'double'}, 'Infinity')).toHaveProperty('error');
        expect(castKeyValue({name: 'k', type: 'double'}, '1e400')).toHaveProperty('error');
        expect(castKeyValue({name: 'k', type: 'float'}, '-Infinity')).toHaveProperty('error');
    });
    it('accepts a finite float', () => {
        expect(castKeyValue({name: 'k', type: 'double'}, '1.5')).toEqual({value: 1.5});
    });
});

describe('formatRawKeyDraft', () => {
    it('round-trips supported scalars through Unipika without losing integer precision', () => {
        const columns = [
            {name: 'signed', type: 'int64'},
            {name: 'unsigned', type: 'uint64'},
            {name: 'small', type: 'uint32'},
            {name: 'enabled', type: 'boolean'},
            {name: 'share', type: 'double'},
            {name: 'label', type: 'string'},
        ];
        const values = {
            signed: '-9223372036854775808',
            unsigned: '18446744073709551615',
            small: '4294967295',
            enabled: 'true',
            share: '1.5e2',
            label: ' ключ;"x"\\ ',
        };
        const formatted = formatRawKeyDraft(columns, values);
        expect(formatted).toContain('18446744073709551615u');
        expect(formatted).toContain('4294967295u');
        expect(parseRawKeyDraft(formatted, columns)).toEqual({values: {...values, share: '150'}});
    });
    it('preserves empty, partial and invalid drafts without casting them', () => {
        const columns = [
            {name: 'n', type: 'int64'},
            {name: 's', type: 'string'},
        ];
        expect(formatRawKeyDraft(columns, {n: '', s: ''})).toBe('');
        expect(formatRawKeyDraft(columns, {n: '', s: 'text'})).toBe('[; "text"]');
        expect(formatRawKeyDraft(columns, {n: 'invalid', s: ' text '})).toBe('[invalid; " text "]');
    });
    it('rejects an unsupported type consistently in both editors', () => {
        const column = {name: 'key', type: 'any'};
        const error = {
            errorKey: 'validation_unsupported-key-type',
            params: {name: 'key', type: 'any'},
        };
        expect(castKeyValue(column, 'value')).toEqual({error});
        expect(parseRawKeyDraft('["value"]', [column])).toEqual({error});
    });
});

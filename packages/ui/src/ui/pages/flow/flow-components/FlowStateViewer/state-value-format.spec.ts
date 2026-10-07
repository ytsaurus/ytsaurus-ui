import {
    buildCompactYsonSettings,
    serializeRawStateValue,
    stringifyStateValue,
} from './state-value-format';

// @ts-expect-error The library does not publish module declarations.
import unipika from '@gravity-ui/unipika/lib/unipika';

describe('stringifyStateValue', () => {
    it('serializes scalars and objects', () => {
        expect(stringifyStateValue(7)).toBe('7');
        expect(stringifyStateValue({a: 1})).toBe('{"a":1}');
    });
    it.each(['int64', 'uint64'])('preserves annotated %s beyond safe Number precision', ($type) => {
        const integer = {$type, $value: '9007199254740993'};
        expect(stringifyStateValue(integer)).toBe('9007199254740993');
        expect(stringifyStateValue({nested: [integer]})).toBe('{"nested":["9007199254740993"]}');
    });
    it('truncates past the limit', () => {
        expect(stringifyStateValue('x'.repeat(300))).toBe(`"${'x'.repeat(199)}…`);
    });
    it('returns an empty string for undefined', () => {
        expect(stringifyStateValue(undefined)).toBe('');
    });
});
describe('serializeRawStateValue', () => {
    it('never truncates', () => {
        const long = 'x'.repeat(300);
        expect(serializeRawStateValue(long)).toBe(JSON.stringify(long));
    });
    it('returns an empty string for undefined', () => {
        expect(serializeRawStateValue(undefined)).toBe('');
    });
});

describe('buildCompactYsonSettings', () => {
    it('renders a realistic multi-key state value with no multi-space indentation runs', () => {
        const value = {
            alignment_timestamp_memory: {inflight_keys: []},
            avg_offset_byte_size: 4957.481529702713,
            committed_offset_exclusive: 3925236713,
            committed_offset_exclusive_v2: [3925236713],
            last_idle_instant: '1970-01-01T00:00:00.000000Z',
            max_offset_is_confirmed: false,
            offset_memory: {inflight_keys: []},
        };

        const settings = buildCompactYsonSettings({
            format: 'json',
            showDecoded: true,
            compact: false,
            escapeWhitespace: true,
            binaryAsHex: true,
            asHTML: false,
        } as Parameters<typeof buildCompactYsonSettings>[0]);

        const formatted = unipika.formatFromYSON(value, settings);

        expect(formatted).not.toMatch(/[ \u00a0]{2,}/);
        expect(formatted).not.toContain('\n');
    });
});

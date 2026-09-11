import {
    buildHeavyHitterStateLink,
    parseHeavyHitterEntry,
    parseHeavyHitterKeyText,
    parseHeavyHitterStateSeed,
    splitHeavyHittersMessages,
} from './heavy-hitters';

const heavyHittersMessage = {
    level: 'info' as const,
    text: 'Top 2 heavy hitters',
    yson: [
        'Key=[0#7147230554789414993u, 1#"17853020244229040161506001"], Ratio=0.306083, PartitionId=451c1f9-678607be-3b545a99-97dc719a',
        'Key=[0#16309018135344887709u, 1#"17853033360341882129806001"], Ratio=0.181031, PartitionId=9ea1d52c-18873875-d7452d51-f068ca47',
    ],
};

describe('splitHeavyHittersMessages', () => {
    it('parses the heavy hitters message and removes it from the remaining messages', () => {
        const other = {level: 'warning' as const, text: 'something else'};
        expect(splitHeavyHittersMessages([other, heavyHittersMessage])).toEqual({
            heavyHitters: {
                title: 'Top 2 heavy hitters',
                entries: [
                    {
                        keyText: '[0#7147230554789414993u, 1#"17853020244229040161506001"]',
                        ratio: 0.306083,
                        partitionId: '451c1f9-678607be-3b545a99-97dc719a',
                    },
                    {
                        keyText: '[0#16309018135344887709u, 1#"17853033360341882129806001"]',
                        ratio: 0.181031,
                        partitionId: '9ea1d52c-18873875-d7452d51-f068ca47',
                    },
                ],
                unparsedEntries: [],
            },
            otherMessages: [other],
        });
    });
    it('keeps every message when no heavy hitters message is present', () => {
        const other = {level: 'info' as const, text: 'Top of the morning', yson: []};
        expect(splitHeavyHittersMessages([other])).toEqual({otherMessages: [other]});
        expect(splitHeavyHittersMessages(undefined)).toEqual({otherMessages: []});
    });
    it('collects unparsable lines separately', () => {
        expect(
            splitHeavyHittersMessages([
                {level: 'info', text: 'Top 1 heavy hitters', yson: ['Key=[0#1u], Ratio=x, Part=y']},
            ]),
        ).toEqual({
            heavyHitters: {
                title: 'Top 1 heavy hitters',
                entries: [],
                unparsedEntries: ['Key=[0#1u], Ratio=x, Part=y'],
            },
            otherMessages: [],
        });
    });
});

describe('parseHeavyHitterKeyText', () => {
    it('parses column-id prefixed values produced by the flow controller', () => {
        expect(
            parseHeavyHitterKeyText('[0#7147230554789414993u, 1#"17853020244229040161506001"]'),
        ).toEqual(['7147230554789414993', '17853020244229040161506001']);
    });
    it('parses a bare single value, booleans and negative integers', () => {
        expect(parseHeavyHitterKeyText('[7u]')).toEqual(['7']);
        expect(parseHeavyHitterKeyText('[0#%true, 1#-12]')).toEqual(['true', '-12']);
    });
    it('keeps a comma inside a quoted value', () => {
        expect(parseHeavyHitterKeyText('[0#"a,b", 1#2]')).toEqual(['a,b', '2']);
    });
    it('rejects out-of-order column ids, escapes, unbalanced quotes and non-list text', () => {
        expect(parseHeavyHitterKeyText('[1#1u, 0#2u]')).toBeUndefined();
        expect(parseHeavyHitterKeyText('[0#"a\\"b"]')).toBeUndefined();
        expect(parseHeavyHitterKeyText('[0#"ab]')).toBeUndefined();
        expect(parseHeavyHitterKeyText('0#1u')).toBeUndefined();
        expect(parseHeavyHitterKeyText('[]')).toBeUndefined();
        expect(parseHeavyHitterKeyText('[0#{a=1}]')).toBeUndefined();
    });
});

describe('buildHeavyHitterStateLink', () => {
    it('builds a computation state-tab link carrying the pipeline path and the seed', () => {
        expect(
            buildHeavyHitterStateLink('hahn', '//pipeline', 'state', {keyValues: {key: '7'}}),
        ).toBe(
            '/hahn/flows/computations/state/state?path=%2F%2Fpipeline&heavyHitterSeed=%7B%22keyValues%22%3A%7B%22key%22%3A%227%22%7D%7D',
        );
    });
    it('percent-encodes a computation id containing special characters', () => {
        expect(
            buildHeavyHitterStateLink('hahn', '//pipeline', 'a/b', {partitionId: 'p'}),
        ).toContain('/computations/a%2Fb/state');
    });
});

describe('parseHeavyHitterStateSeed', () => {
    it('round-trips keyValues and partitionId through the built link', () => {
        const seed = {keyValues: {key: '7'}, partitionId: 'p1'};
        const url = buildHeavyHitterStateLink('hahn', '//pipeline', 'state', seed);
        const params = new URLSearchParams(url.split('?')[1]);
        expect(params.get('path')).toBe('//pipeline');
        expect(parseHeavyHitterStateSeed(params.get('heavyHitterSeed'))).toEqual(seed);
    });
    it('returns undefined for missing, malformed or empty input', () => {
        expect(parseHeavyHitterStateSeed(null)).toBeUndefined();
        expect(parseHeavyHitterStateSeed('not json')).toBeUndefined();
        expect(parseHeavyHitterStateSeed('null')).toBeUndefined();
        expect(parseHeavyHitterStateSeed('{}')).toBeUndefined();
        expect(parseHeavyHitterStateSeed('[]')).toBeUndefined();
    });
    it('drops non-string keyValues entries and a non-string partitionId', () => {
        expect(
            parseHeavyHitterStateSeed(JSON.stringify({partitionId: 5, keyValues: {a: '1', b: 2}})),
        ).toEqual({keyValues: {a: '1'}});
    });
});

describe('parseHeavyHitterEntry', () => {
    it('parses a well-formed entry', () => {
        expect(parseHeavyHitterEntry('Key=[1#a], Ratio=0.25, PartitionId=p-3')).toEqual({
            keyText: '[1#a]',
            ratio: 0.25,
            partitionId: 'p-3',
        });
    });

    it('keeps the last separators so a key may contain them', () => {
        expect(parseHeavyHitterEntry('Key=[x, Ratio=y], Ratio=0.5, PartitionId=p-1')).toEqual({
            keyText: '[x, Ratio=y]',
            ratio: 0.5,
            partitionId: 'p-1',
        });
    });

    it('returns undefined for malformed lines', () => {
        expect(parseHeavyHitterEntry('Key=[1], Ratio=abc, PartitionId=p-1')).toBeUndefined();
        expect(parseHeavyHitterEntry('Key=[1], Ratio=0.5, PartitionId=')).toBeUndefined();
        expect(parseHeavyHitterEntry('nonsense')).toBeUndefined();
    });
});

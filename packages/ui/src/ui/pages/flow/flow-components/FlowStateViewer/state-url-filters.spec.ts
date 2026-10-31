import {
    createParamsString,
    parseParams,
    setParamDecoder,
    setParamEncoder,
} from 'redux-location-state/lib/helpers';

import type {FlowKeyColumn} from '../../../../../shared/yt-types';
import {isFlowStatePathname} from '../../../../store/reducers/flow/url-mapping';
import {
    customEncodeURIComponent,
    safeDecodeURIComponent,
    splitQueryParam,
} from '../../../../utils/url-mapping';
import {buildHeavyHitterStateLink, parseHeavyHitterStateSeed} from './heavy-hitters';
import {
    describeKeyText,
    restoreStateViewerUrlState,
    serializeStateViewerUrlState,
    toPersistedStateFilters,
    toStateViewerUrlState,
} from './state-url-filters';

jest.mock('../../../../store/reducers/prometheusDashboard/url-mapping', () => ({
    prometheusDashboardParams: {},
}));

const columns: Array<FlowKeyColumn> = [
    {name: 'id', type: 'uint64'},
    {name: 'label', type: 'string'},
];

const emptyUrlFilters = {
    stateViewerComputation: '',
    stateViewerPartition: '',
    stateViewerTarget: '',
    stateViewerName: '',
    stateViewerKeyText: '',
};

const emptyUrlState = {...emptyUrlFilters, stateViewerHeavyHitterSeed: ''};

describe('describeKeyText', () => {
    it('keeps a visible draft verbatim', () => {
        expect(
            describeKeyText(
                {keyValues: {id: '1', label: 'a'}, keyText: '[9007199254740993', target: 'all'},
                columns,
            ),
        ).toBe('[9007199254740993');
    });
    it('formats committed schema values and runtime keys when no draft exists', () => {
        const formatted = describeKeyText(
            {keyValues: {id: '9007199254740993', label: 'Веник'}, target: 'all'},
            columns,
        );
        expect(formatted).toContain('9007199254740993');
        expect(formatted).toContain('Веник');
        expect(describeKeyText({keyValues: {}, rawKey: ['alice', 7], target: 'all'}, [])).toBe(
            '["alice",7]',
        );
        expect(describeKeyText({keyValues: {}, target: 'all'}, [])).toBe('');
    });
});

describe('url state mapping', () => {
    it('maps a pipeline-tab snapshot to url fields', () => {
        expect(
            toStateViewerUrlState(
                toPersistedStateFilters(
                    {
                        computationId: 'checkout',
                        partitionId: 'p-1',
                        stateName: '/counter',
                        target: 'key_state',
                        keyValues: {},
                        keyText: '[1u; "a"]',
                    },
                    columns,
                ),
                {},
            ),
        ).toEqual({
            stateViewerComputation: 'checkout',
            stateViewerPartition: 'p-1',
            stateViewerTarget: 'key_state',
            stateViewerName: '/counter',
            stateViewerKeyText: '[1u; "a"]',
        });
    });
    it('omits the fixed computation of a computation tab and the default target', () => {
        expect(
            toStateViewerUrlState(
                {computationId: 'checkout', target: 'all', keyText: ''},
                {fixedComputationId: 'checkout'},
            ),
        ).toEqual({
            stateViewerComputation: '',
            stateViewerPartition: '',
            stateViewerTarget: '',
            stateViewerName: '',
            stateViewerKeyText: '',
        });
    });
    it('treats an empty url state as absent, not malformed', () => {
        expect(restoreStateViewerUrlState(emptyUrlState, {withSeed: true})).toEqual({
            filters: undefined,
            malformed: false,
            heavyHitterSeed: undefined,
        });
    });
    it('restores every field and leaves the committed key to the text', () => {
        expect(
            restoreStateViewerUrlState(
                {
                    ...emptyUrlState,
                    stateViewerComputation: 'checkout',
                    stateViewerTarget: 'external_key_state',
                    stateViewerName: '/profile',
                    stateViewerKeyText: '[9007199254740993',
                },
                {withSeed: false},
            ),
        ).toEqual({
            filters: {
                computationId: 'checkout',
                partitionId: undefined,
                target: 'external_key_state',
                stateName: '/profile',
                keyValues: {},
                rawKey: undefined,
                keyText: '[9007199254740993',
            },
            malformed: false,
            heavyHitterSeed: undefined,
        });
    });
    it('accepts an explicit all target and marks any unrecognized nonempty target as malformed', () => {
        expect(
            restoreStateViewerUrlState(
                {...emptyUrlState, stateViewerTarget: 'all'},
                {withSeed: false},
            ).malformed,
        ).toBe(false);
        for (const target of ['bogus', '__proto__', 'KEY_STATE', 'key_state ', '\u0000key_state']) {
            expect(
                restoreStateViewerUrlState(
                    {
                        ...emptyUrlState,
                        stateViewerComputation: 'checkout',
                        stateViewerTarget: target,
                    },
                    {withSeed: false},
                ),
            ).toEqual({
                filters: {
                    computationId: 'checkout',
                    partitionId: undefined,
                    target: 'all',
                    stateName: undefined,
                    keyValues: {},
                    rawKey: undefined,
                    keyText: undefined,
                },
                malformed: true,
                heavyHitterSeed: undefined,
            });
        }
    });
    it('drops undecodable values and marks the state malformed', () => {
        expect(
            restoreStateViewerUrlState(
                {
                    ...emptyUrlState,
                    stateViewerComputation: 'checkout',
                    stateViewerName: '\u0000%E0',
                    stateViewerKeyText: '\u0000%5B%ZZ',
                },
                {withSeed: false},
            ),
        ).toEqual({
            filters: {
                computationId: 'checkout',
                partitionId: undefined,
                target: 'all',
                stateName: undefined,
                keyValues: {},
                rawKey: undefined,
                keyText: undefined,
            },
            malformed: true,
            heavyHitterSeed: undefined,
        });
    });
    it('parses a legacy seed only on the computation route and marks an unparseable seed malformed', () => {
        const seedText = JSON.stringify({keyValues: {id: '7', label: 'a b+c'}});
        expect(
            restoreStateViewerUrlState(
                {...emptyUrlState, stateViewerHeavyHitterSeed: seedText},
                {withSeed: true},
            ),
        ).toEqual({
            filters: undefined,
            malformed: false,
            heavyHitterSeed: {keyValues: {id: '7', label: 'a b+c'}},
        });
        expect(
            restoreStateViewerUrlState(
                {...emptyUrlState, stateViewerHeavyHitterSeed: seedText},
                {withSeed: false},
            ),
        ).toEqual({filters: undefined, malformed: false, heavyHitterSeed: undefined});
        expect(
            restoreStateViewerUrlState(
                {...emptyUrlState, stateViewerHeavyHitterSeed: '{not-json'},
                {withSeed: true},
            ),
        ).toEqual({filters: undefined, malformed: true, heavyHitterSeed: undefined});
        expect(
            restoreStateViewerUrlState(
                {...emptyUrlState, stateViewerHeavyHitterSeed: '\u0000%7B%ZZ'},
                {withSeed: true},
            ),
        ).toEqual({filters: undefined, malformed: true, heavyHitterSeed: undefined});
    });
    it('serializes the pipeline computation and the seed only on their own routes', () => {
        const urlState = {
            ...emptyUrlState,
            stateViewerComputation: 'c',
            stateViewerKeyText: '[1',
            stateViewerHeavyHitterSeed: '{"keyValues":{"id":"7"}}',
        };
        expect(serializeStateViewerUrlState(urlState, {withSeed: false})).toBe(
            JSON.stringify(['c', '', '', '', '[1', '']),
        );
        expect(serializeStateViewerUrlState(urlState, {withSeed: true})).toBe(
            JSON.stringify(['', '', '', '', '[1', '{"keyValues":{"id":"7"}}']),
        );
    });
    it('keeps an explicitly cleared form distinguishable from an absent one where absence restores defaults', () => {
        const clearedPipelineForm = toStateViewerUrlState({target: 'all', keyText: ''}, {});
        expect(clearedPipelineForm).toEqual({...emptyUrlFilters, stateViewerTarget: 'all'});
        expect(
            restoreStateViewerUrlState(
                {...emptyUrlState, ...clearedPipelineForm},
                {withSeed: false},
            ),
        ).toEqual({
            filters: {
                computationId: undefined,
                partitionId: undefined,
                target: 'all',
                stateName: undefined,
                keyValues: {},
                rawKey: undefined,
                keyText: undefined,
            },
            malformed: false,
            heavyHitterSeed: undefined,
        });
        const seedText = JSON.stringify({keyValues: {id: '7', label: 'alice'}});
        const clearedSeededForm = toStateViewerUrlState(
            {computationId: 'checkout', target: 'all', keyText: ''},
            {fixedComputationId: 'checkout', hasHeavyHitterSeed: true},
        );
        expect(clearedSeededForm.stateViewerTarget).toBe('all');
        expect(
            restoreStateViewerUrlState(
                {...emptyUrlState, ...clearedSeededForm, stateViewerHeavyHitterSeed: seedText},
                {withSeed: true},
            ).filters,
        ).toEqual(expect.objectContaining({target: 'all', keyText: undefined, keyValues: {}}));
    });
    it('omits the all target whenever another field already marks the form as present', () => {
        expect(
            toStateViewerUrlState({computationId: 'checkout', target: 'all', keyText: ''}, {}),
        ).toEqual({...emptyUrlFilters, stateViewerComputation: 'checkout'});
        expect(
            toStateViewerUrlState(
                {computationId: 'checkout', target: 'all', stateName: '/n', keyText: ''},
                {fixedComputationId: 'checkout', hasHeavyHitterSeed: true},
            ),
        ).toEqual({...emptyUrlFilters, stateViewerName: '/n'});
    });
    it('ignores a retained pipeline computation on the computation route', () => {
        const seedText = JSON.stringify({keyValues: {id: '7', label: 'alice'}});
        for (const stateViewerComputation of ['checkout', '\u0000%ZZ']) {
            expect(
                restoreStateViewerUrlState(
                    {
                        ...emptyUrlState,
                        stateViewerComputation,
                        stateViewerHeavyHitterSeed: seedText,
                    },
                    {withSeed: true},
                ),
            ).toEqual({
                filters: undefined,
                malformed: false,
                heavyHitterSeed: {keyValues: {id: '7', label: 'alice'}},
            });
        }
        expect(
            restoreStateViewerUrlState(
                {...emptyUrlState, stateViewerComputation: '\u0000%ZZ'},
                {withSeed: false},
            ).malformed,
        ).toBe(true);
    });
});

describe('isFlowStatePathname', () => {
    it('recognizes exactly the two registered State routes', () => {
        expect(isFlowStatePathname('/hahn/flows/state')).toBe('pipeline');
        expect(isFlowStatePathname('/hahn/flows/computations/checkout/state')).toBe('computation');
        expect(isFlowStatePathname('/hahn/flows/graph')).toBeUndefined();
        expect(
            isFlowStatePathname('/hahn/flows/computations/checkout/partition/p1'),
        ).toBeUndefined();
        expect(isFlowStatePathname('/hahn/navigation')).toBeUndefined();
    });
});

describe('location boundary', () => {
    beforeAll(() => {
        setParamEncoder(customEncodeURIComponent);
        setParamDecoder(safeDecodeURIComponent);
    });
    it('keeps raw key text lossless through the application encoder and decoder', () => {
        const stateKey = '[9007199254740993u; "Ве ник=&#%+"]';
        const search = createParamsString({path: '//pipeline', stateKey});
        expect(search).toBe(
            '?path=//pipeline&stateKey=%5B9007199254740993u;%20%22%D0%92%D0%B5%20%D0%BD%D0%B8%D0%BA%3D%26%23%25%2B%22%5D',
        );
        expect(parseParams(search, splitQueryParam)).toEqual({path: '//pipeline', stateKey});
    });
    it.each([['["😀&x=#y"]'], ['["😀&x=#y+'], ['[1u; "😀 a+b=c&d#e%"]']])(
        'keeps supplementary characters with delimiters lossless in %s',
        (stateKey) => {
            const search = createParamsString({
                path: '//pipeline',
                stateComputation: 'checkout',
                stateKey,
            });
            expect(search).not.toContain('#');
            expect(search.split('&')).toHaveLength(3);
            expect(parseParams(search, splitQueryParam)).toEqual({
                path: '//pipeline',
                stateComputation: 'checkout',
                stateKey,
            });
        },
    );
    it('decodes the exact bytes of legacy heavy hitter links and of new links identically', () => {
        const seed = {keyValues: {id: '7', label: 'a b+c'}};
        const legacySearch = `?${new URLSearchParams({path: '//pipeline', heavyHitterSeed: JSON.stringify(seed)})}`;
        expect(legacySearch).toBe(
            '?path=%2F%2Fpipeline&heavyHitterSeed=%7B%22keyValues%22%3A%7B%22id%22%3A%227%22%2C%22label%22%3A%22a+b%2Bc%22%7D%7D',
        );
        expect(parseParams(legacySearch).heavyHitterSeed).toBe(
            '{"keyValues":{"id":"7","label":"a+b+c"}}',
        );
        const legacyParsed = parseParams(legacySearch, splitQueryParam);
        expect(legacyParsed).toEqual({path: '//pipeline', heavyHitterSeed: JSON.stringify(seed)});
        expect(parseHeavyHitterStateSeed(legacyParsed.heavyHitterSeed)).toEqual(seed);
        const newSearch = buildHeavyHitterStateLink('hahn', '//pipeline', 'checkout', seed).slice(
            '/hahn/flows/computations/checkout/state'.length,
        );
        expect(newSearch).toBe(
            '?path=%2F%2Fpipeline&heavyHitterSeed=%7B%22keyValues%22%3A%7B%22id%22%3A%227%22%2C%22label%22%3A%22a%20b%2Bc%22%7D%7D',
        );
        expect(parseParams(newSearch, splitQueryParam)).toEqual(legacyParsed);
        expect(parseParams('?stateName=a+b', splitQueryParam)).toEqual({stateName: 'a+b'});
    });
    it('recovers malformed percent escapes without throwing', () => {
        expect(() => decodeURIComponent('%5B%ZZ')).toThrow(URIError);
        expect(safeDecodeURIComponent('%5B%ZZ')).toBe('\u0000%5B%ZZ');
        expect(safeDecodeURIComponent('a%20b')).toBe('a b');
        expect(() =>
            parseParams(
                '?stateKey=%5B%ZZ&stateName=%E0&stateKind=key_state&%ZZ=1',
                splitQueryParam,
            ),
        ).not.toThrow();
        expect(
            parseParams(
                '?stateKey=%5B%ZZ&stateName=%E0&stateKind=key_state&%ZZ=1',
                splitQueryParam,
            ),
        ).toEqual({
            stateKey: '\u0000%5B%ZZ',
            stateName: '\u0000%E0',
            stateKind: 'key_state',
            '\u0000%ZZ': '1',
        });
    });
});

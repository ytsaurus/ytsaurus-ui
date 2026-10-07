import {
    decodeYtString,
    normalizeAnnotatedValue,
    normalizeReadStatesResponse,
} from './read-states-normalize';

describe('normalizeReadStatesResponse', () => {
    it('decodes UTF-8 byte strings recursively while preserving 64-bit annotations', () => {
        const mojibake = 'ÐÐµÐ½Ð¸Ðº-Ñ-Ð¿ÑÐ¾Ð²Ð¾Ð»Ð¾ÐºÐ¾Ð¹-Ð¸-Ð¿Ð»ÐµÐ½ÐºÐ¾Ð¹-Ð¡Ð¾ÑÐ³Ð¾';

        expect(
            normalizeReadStatesResponse({
                key_states: [
                    {
                        computation_id: 'reader',
                        key: [
                            mojibake,
                            {$type: 'uint64', $value: '18446744073709551615'},
                            {[mojibake]: mojibake},
                        ],
                        states: {},
                    },
                ],
            }),
        ).toEqual({
            key_states: [
                {
                    computation_id: 'reader',
                    key: [
                        'Веник-с-проволокой-и-пленкой-Сорго',
                        {$type: 'uint64', $value: '18446744073709551615'},
                        {
                            'Веник-с-проволокой-и-пленкой-Сорго':
                                'Веник-с-проволокой-и-пленкой-Сорго',
                        },
                    ],
                    states: {},
                },
            ],
        });
    });

    it('preserves already decoded and non-UTF-8 strings', () => {
        expect(decodeYtString('Веник')).toBe('Веник');
        expect(decodeYtString('café')).toBe('café');
    });

    it('unwraps annotated scalars while preserving integer type annotations', () => {
        const annotated = {
            key_states: [
                {
                    computation_id: {$type: 'string', $value: 'c'},
                    key: [
                        {$type: 'uint64', $value: '18446744073709551615'},
                        {$type: 'int64', $value: '42'},
                    ],
                    states: {
                        '/s': {
                            count: {$type: 'uint64', $value: '9007199254740993'},
                            enabled: {$type: 'boolean', $value: 'true'},
                            share: {$type: 'double', $value: '0.5'},
                            note: {$type: 'string', $value: 'text'},
                        },
                    },
                },
            ],
            errors: [{$type: 'string', $value: 'boom'}],
        };
        expect(normalizeReadStatesResponse(annotated)).toEqual({
            key_states: [
                {
                    computation_id: 'c',
                    key: [
                        {$type: 'uint64', $value: '18446744073709551615'},
                        {$type: 'int64', $value: '42'},
                    ],
                    states: {
                        '/s': {
                            count: {$type: 'uint64', $value: '9007199254740993'},
                            enabled: true,
                            share: 0.5,
                            note: 'text',
                        },
                    },
                },
            ],
            errors: ['boom'],
        });
    });
    it('preserves integer annotations on both sides of the safe-number boundary', () => {
        expect(normalizeAnnotatedValue({$type: 'uint64', $value: '9007199254740991'})).toEqual({
            $type: 'uint64',
            $value: '9007199254740991',
        });
        expect(normalizeAnnotatedValue({$type: 'int64', $value: '-9007199254740991'})).toEqual({
            $type: 'int64',
            $value: '-9007199254740991',
        });
        expect(normalizeAnnotatedValue({$type: 'uint64', $value: '9007199254740992'})).toEqual({
            $type: 'uint64',
            $value: '9007199254740992',
        });
    });
    it('preserves attribute-carrying nodes in the unipika convention', () => {
        expect(
            normalizeAnnotatedValue({
                $attributes: {cluster: {$type: 'string', $value: 'seneca'}},
                $value: {$type: 'string', $value: '//home/t'},
            }),
        ).toEqual({
            $attributes: {cluster: 'seneca'},
            $value: '//home/t',
        });
    });
    it('keeps attributes attached to an unsafe integer', () => {
        expect(
            normalizeAnnotatedValue({
                $attributes: {a: {$type: 'int64', $value: '1'}},
                $type: 'uint64',
                $value: '18446744073709551615',
            }),
        ).toEqual({
            $attributes: {a: {$type: 'int64', $value: '1'}},
            $type: 'uint64',
            $value: '18446744073709551615',
        });
    });
    it('passes plain trees through untouched', () => {
        expect(normalizeAnnotatedValue({a: [1, 'x', true, null]})).toEqual({
            a: [1, 'x', true, null],
        });
    });
    it('recurses fields when annotation keys sit alongside unrelated siblings', () => {
        expect(
            normalizeAnnotatedValue({
                $type: 'not-a-real-type',
                otherField: {$type: 'int64', $value: '5'},
            }),
        ).toEqual({
            $type: 'not-a-real-type',
            otherField: {$type: 'int64', $value: '5'},
        });
    });
    it('unwraps values with sibling fields according to ypath semantics', () => {
        expect(normalizeAnnotatedValue({$type: 'string', $value: 'text', extra: 'ignored'})).toBe(
            'text',
        );
        expect(
            normalizeAnnotatedValue({$type: 'int64', $value: '9007199254740993', extra: 1}),
        ).toEqual({
            $type: 'int64',
            $value: '9007199254740993',
        });
        expect(normalizeAnnotatedValue({$type: 'string'})).toEqual({$type: 'string'});
    });
    it('distinguishes missing attributes from an empty attribute set', () => {
        expect(normalizeAnnotatedValue({$type: 'string', $value: 'text'})).toBe('text');
        expect(normalizeAnnotatedValue({$attributes: {}, $type: 'string', $value: 'text'})).toEqual(
            {
                $attributes: {},
                $value: 'text',
            },
        );
    });
    it('keeps a malformed typed integer annotated instead of throwing, sparing sibling rows', () => {
        const response = {
            key_states: [
                {
                    computation_id: {$type: 'string', $value: 'c'},
                    states: {
                        '/broken': {$type: 'uint64', $value: 'not-a-number'},
                        '/empty': {$type: 'int64', $value: ''},
                        '/overflow': {$type: 'uint64', $value: '99999999999999999999999999'},
                        '/good': {$type: 'int64', $value: '42'},
                    },
                },
            ],
        };
        expect(normalizeReadStatesResponse(response)).toEqual({
            key_states: [
                {
                    computation_id: 'c',
                    states: {
                        '/broken': {$type: 'uint64', $value: 'not-a-number'},
                        '/empty': {$type: 'int64', $value: ''},
                        '/overflow': {$type: 'uint64', $value: '99999999999999999999999999'},
                        '/good': {$type: 'int64', $value: '42'},
                    },
                },
            ],
        });
    });
});

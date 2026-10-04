import {type FlowDynamicSpecSnapshot} from '../../../shared/yt-types';
import {
    UnsafeDynamicSpecVersionError,
    decodeDynamicSpecAudit,
    decodeDynamicSpecValue,
    dynamicSpecEdits,
    dynamicSpecEffectiveSource,
    dynamicSpecHasComment,
    dynamicSpecOverrideEditor,
    dynamicSpecOverrideRows,
    dynamicSpecPath,
    dynamicSpecSource,
    dynamicSpecValue,
    dynamicSpecVersion,
    encodeDynamicSpecValue,
} from './dynamic-spec';

const version = {$type: 'int64' as const, $value: '1923189626042933625'};
const newer = {$type: 'int64' as const, $value: '1923189626042933626'};

describe('dynamic spec update comments', () => {
    it('requires a reason outside Unicode White_Space and BOM', () => {
        const blank = [
            0x9, 0xa, 0xb, 0xc, 0xd, 0x20, 0x85, 0xa0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003,
            0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a, 0x2028, 0x2029, 0x202f, 0x205f,
            0x3000, 0xfeff,
        ];
        expect(blank).toHaveLength(26);
        for (const codepoint of blank) {
            expect(dynamicSpecHasComment(String.fromCodePoint(codepoint))).toBe(false);
        }
        expect(
            dynamicSpecHasComment(
                blank.map((codepoint) => String.fromCodePoint(codepoint)).join(''),
            ),
        ).toBe(false);
        expect(dynamicSpecHasComment(undefined)).toBe(false);
        expect(dynamicSpecHasComment('')).toBe(false);
        for (const reason of ['\u200b', '\u001c', '\u001d', '\u001e', '\u001f', 'Причина 😊']) {
            expect(dynamicSpecHasComment(reason)).toBe(true);
        }
    });
});

const snapshot: FlowDynamicSpecSnapshot = {
    version: newer,
    base_spec: {group: {removed: 1, retained: 2, pin: 3}, list: [1, 2]},
    effective_spec: {},
    override_spec: {
        operation: 'map',
        children: {
            group: {
                operation: 'map',
                version,
                value: {},
                children: {
                    retained: {operation: 'inherit'},
                    pin: {operation: 'set', version: newer, value: 3},
                },
            },
            list: {operation: 'set', version, value: [1, 3]},
            empty: {operation: 'map', version, value: {}},
            mask: {operation: 'map', version},
            missing: {operation: 'remove', version},
        },
    },
    audit: [
        {version, timestamp: '2026-10-04T10:00:00Z', comment: 'Pin'},
        {version: newer, timestamp: '2026-10-04T10:01:00Z', comment: 'Новое значение'},
    ],
};

describe('dynamic spec provenance', () => {
    it('keeps adjacent 19-digit revisions distinct', () => {
        expect(dynamicSpecVersion(version)).toBe('1923189626042933625');
        expect(dynamicSpecVersion(newer)).toBe('1923189626042933626');
        expect(dynamicSpecSource(snapshot, ['group', 'pin'])).toMatchObject({
            source: 'override',
            version: newer.$value,
            audit: {comment: 'Новое значение'},
        });
        expect(() => dynamicSpecVersion(Number(version.$value))).toThrow(
            UnsafeDynamicSpecVersionError,
        );
    });
    it('attributes omitted base keys to the replacing map', () => {
        expect(dynamicSpecSource(snapshot, ['group', 'removed'])).toMatchObject({
            source: 'override',
            version: version.$value,
        });
        expect(
            dynamicSpecOverrideRows(snapshot).find(({path}) => path.join('/') === 'group'),
        ).toMatchObject({operation: 'map', value: {}, source: {version: version.$value}});
        expect(
            dynamicSpecOverrideRows(snapshot).find(({path}) => path.join('/') === 'group/removed'),
        ).toBeUndefined();
    });
    it('inherits current base through holes without ancestor attribution', () => {
        expect(dynamicSpecSource(snapshot, ['group', 'retained'])).toEqual({source: 'base'});
        const rows = dynamicSpecOverrideRows(snapshot);
        expect(rows.find(({path}) => path.join('/') === 'group/retained')).toMatchObject({
            operation: 'inherit',
            value: 2,
            source: {source: 'base'},
        });
    });
    it('retains explicit pins equal to the base', () => {
        expect(
            dynamicSpecOverrideRows(snapshot).find(({path}) => path.join('/') === 'group/pin'),
        ).toMatchObject({operation: 'set', value: 3, source: {version: newer.$value}});
    });
    it('assigns every list index to its atomic owner', () => {
        expect(dynamicSpecSource(snapshot, ['list', '0'])).toMatchObject({version: version.$value});
        expect(dynamicSpecSource(snapshot, ['list', '1'])).toMatchObject({version: version.$value});
    });
    it('attributes inherited list items to the base', () => {
        expect(
            dynamicSpecSource({...snapshot, override_spec: {operation: 'inherit'}}, ['list', '0']),
        ).toEqual({source: 'base'});
    });
    it('distinguishes owned empty maps, deletion masks and absent removals', () => {
        const rows = dynamicSpecOverrideRows(snapshot);
        expect(rows.find(({path}) => path[0] === 'empty')).toMatchObject({
            operation: 'map',
            value: {},
        });
        expect(rows.find(({path}) => path[0] === 'mask')).toMatchObject({
            operation: 'mask',
            value: undefined,
        });
        expect(rows.find(({path}) => path[0] === 'missing')).toMatchObject({operation: 'remove'});
    });
    it('does not attribute all descendants of unversioned maps', () => {
        expect(dynamicSpecSource(snapshot, ['other'])).toEqual({source: 'default'});
        expect(dynamicSpecSource(snapshot, ['group', 'retained', 'nested'])).toEqual({
            source: 'default',
        });
    });
    it('shows runtime target state separately from user ownership', () => {
        expect(
            dynamicSpecSource({...snapshot, runtime_target_state: 'completed'}, ['target_state']),
        ).toEqual({source: 'runtime'});
        expect(
            dynamicSpecSource({...snapshot, runtime_target_state: 'completed'}, ['list', '1']),
        ).toMatchObject({version: version.$value});
    });
    it('has no user override rows for an inherited tree', () => {
        expect(
            dynamicSpecOverrideRows({
                ...snapshot,
                override_spec: {operation: 'inherit'},
                audit: [],
            }),
        ).toEqual([]);
    });
});

describe('effective display provenance', () => {
    it('does not attribute normalized defaults to the replacing map', () => {
        const state: FlowDynamicSpecSnapshot = {
            ...snapshot,
            base_spec: {throttlers: {}},
            effective_spec: {
                throttlers: {
                    demo: {limit: 1000, rpc_timeout: 30000, retrying_channel: {max_attempts: 100}},
                },
            },
            override_spec: {
                operation: 'map',
                children: {
                    throttlers: {
                        operation: 'map',
                        children: {
                            demo: {
                                operation: 'map',
                                version,
                                value: {},
                                children: {limit: {operation: 'set', version, value: 1000}},
                            },
                        },
                    },
                },
            },
        };
        for (const path of [
            ['throttlers', 'demo', 'rpc_timeout'],
            ['throttlers', 'demo', 'retrying_channel'],
            ['throttlers', 'demo', 'retrying_channel', 'max_attempts'],
        ]) {
            expect(dynamicSpecSource(state, path)).toMatchObject({source: 'override'});
            expect(dynamicSpecEffectiveSource(state, path)).toEqual({source: 'default'});
        }
        expect(dynamicSpecEffectiveSource(state, ['throttlers'])).toEqual({source: 'base'});
        expect(dynamicSpecEffectiveSource(state, ['throttlers', 'demo'])).toMatchObject({
            version: version.$value,
        });
        expect(dynamicSpecEffectiveSource(state, ['throttlers', 'demo', 'limit'])).toMatchObject({
            version: version.$value,
        });
    });
    it('retains masked base, explicit removals, inherited holes and newer atomic owners', () => {
        expect(dynamicSpecEffectiveSource(snapshot, ['group', 'removed'])).toMatchObject({
            version: version.$value,
        });
        expect(dynamicSpecEffectiveSource(snapshot, ['missing'])).toMatchObject({
            version: version.$value,
        });
        expect(dynamicSpecEffectiveSource(snapshot, ['group', 'retained'])).toEqual({
            source: 'base',
        });
        expect(dynamicSpecEffectiveSource(snapshot, ['group', 'pin'])).toMatchObject({
            version: newer.$value,
        });
        expect(dynamicSpecEffectiveSource(snapshot, ['list', '0'])).toMatchObject({
            version: version.$value,
        });
    });
    it('attributes raw seed keys without attributing newly normalized siblings', () => {
        const state: FlowDynamicSpecSnapshot = {
            ...snapshot,
            base_spec: {},
            override_spec: {
                operation: 'map',
                version,
                value: JSON.parse('{"constructor":[1],"__proto__":2,"nested":{"explicit":7}}'),
            },
        };
        for (const path of [['constructor', '0'], ['__proto__'], ['nested', 'explicit']]) {
            expect(dynamicSpecEffectiveSource(state, path)).toMatchObject({
                version: version.$value,
            });
        }
        expect(dynamicSpecEffectiveSource(state, ['nested', 'default'])).toEqual({
            source: 'default',
        });
        expect(dynamicSpecEffectiveSource(state, ['toString'])).toEqual({source: 'default'});
    });
});

describe('grouped raw map overrides', () => {
    const map = {
        operation: 'map' as const,
        version,
        value: {},
        children: {
            limit: {operation: 'set' as const, version, value: {$type: 'double', $value: '1000'}},
            period: {operation: 'set' as const, version, value: 1000},
        },
    };
    const state: FlowDynamicSpecSnapshot = {
        ...snapshot,
        base_spec: {demo: {omitted: 7}},
        effective_spec: {demo: {limit: 1000, period: 1000, rpc_timeout: 10000, classes: {}}},
        override_spec: {operation: 'map', children: {demo: map}},
    };
    it('groups an owned map into one row without normalized defaults or synthetic removals', () => {
        const rows = dynamicSpecOverrideRows(state);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({
            path: ['demo'],
            operation: 'map',
            value: {limit: {$type: 'double', $value: '1000'}, period: 1000},
            editorValue: {limit: {$type: 'double', $value: '1000'}, period: 1000},
            hasInheritedFields: false,
        });
        expect(dynamicSpecOverrideEditor(state, ['demo'])?.value).toEqual(rows[0].value);
    });
    it('shows a newer child separately while the editable parent preserves its current raw value', () => {
        const mixed = {
            ...state,
            override_spec: {
                operation: 'map' as const,
                children: {
                    demo: {
                        ...map,
                        children: {
                            ...map.children,
                            limit: {operation: 'set' as const, version: newer, value: 2000},
                        },
                    },
                },
            },
        };
        const rows = dynamicSpecOverrideRows(mixed);
        expect(rows).toHaveLength(2);
        expect(rows[0]).toMatchObject({
            value: {period: 1000},
            editorValue: {limit: 2000, period: 1000},
            hasInheritedFields: false,
            source: {version: version.$value},
        });
        expect(rows[1]).toMatchObject({
            path: ['demo', 'limit'],
            value: 2000,
            source: {version: newer.$value},
        });
    });
    it('detects recursive inheritance and keeps the hole visible without pinning its base value', () => {
        const holes = {
            ...state,
            override_spec: {
                operation: 'map' as const,
                children: {
                    demo: {
                        ...map,
                        children: {
                            ...map.children,
                            nested: {
                                operation: 'map' as const,
                                children: {hole: {operation: 'inherit' as const}},
                            },
                        },
                    },
                },
            },
        };
        const rows = dynamicSpecOverrideRows(holes);
        expect(rows[0]).toMatchObject({hasInheritedFields: true});
        expect(rows[0].editorValue).toEqual({
            limit: {$type: 'double', $value: '1000'},
            period: 1000,
        });
        expect(rows[1]).toMatchObject({path: ['demo', 'nested', 'hole'], operation: 'inherit'});
        expect(dynamicSpecOverrideEditor(holes, ['demo'])?.hasInheritedFields).toBe(true);
    });
    it('preserves typed scalar/list values and prototype-named own keys in the raw map', () => {
        const value = JSON.parse('{"__proto__":1,"constructor":[1,2]}');
        const prototype = {
            ...state,
            override_spec: {
                operation: 'map' as const,
                children: {
                    demo: {
                        ...map,
                        children: Object.fromEntries(
                            Object.entries(value).map(([key, childValue]) => [
                                key,
                                {operation: 'set' as const, version, value: childValue},
                            ]),
                        ),
                    },
                },
            },
        };
        expect(dynamicSpecOverrideEditor(prototype, ['demo'])?.value).toEqual(value);
        expect(Object.keys(dynamicSpecOverrideRows(prototype)[0].value as object)).toEqual([
            '__proto__',
            'constructor',
        ]);
    });
    it('keeps an independent child visible after the enclosing map owner is cancelled', () => {
        const cancelled = {
            ...state,
            override_spec: {
                operation: 'map' as const,
                children: {
                    demo: {
                        operation: 'map' as const,
                        children: {limit: {operation: 'set' as const, version: newer, value: 2000}},
                    },
                },
            },
        };
        const rows = dynamicSpecOverrideRows(cancelled);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({
            path: ['demo', 'limit'],
            value: 2000,
            source: {source: 'override', version: newer.$value},
        });
        expect(dynamicSpecOverrideEditor(cancelled, ['demo'])).toBeUndefined();
    });
    it('does not replace an effective removed scalar with a missing raw value', () => {
        const removed = {
            ...state,
            override_spec: {
                operation: 'map' as const,
                children: {
                    demo: {
                        ...map,
                        children: {
                            ...map.children,
                            period: {operation: 'remove' as const, version: newer},
                        },
                    },
                },
            },
        };
        expect(dynamicSpecOverrideEditor(removed, ['demo', 'period'])).toBeUndefined();
    });
    it('reconstructs a deletion mask with a current independent child without creating empty-map intent', () => {
        const masked = {
            ...state,
            override_spec: {
                operation: 'map' as const,
                children: {
                    demo: {
                        operation: 'map' as const,
                        version,
                        children: {limit: {operation: 'set' as const, version: newer, value: 2000}},
                    },
                },
            },
        };
        expect(dynamicSpecOverrideRows(masked)[0]).toMatchObject({
            operation: 'mask',
            value: undefined,
            editorValue: {limit: 2000},
        });
        expect(dynamicSpecOverrideEditor(masked, ['demo'])?.value).toEqual({limit: 2000});
    });
});

describe('DynamicSpec editor and web-json audit', () => {
    it('preserves unchanged byte strings and non-ASCII keys when editing a subtree', () => {
        const key = Buffer.from('Квота', 'utf8').toString('latin1');
        const label = Buffer.from('Квота 😊', 'utf8').toString('latin1');
        const original = {changed: 1, label, binary: '\xff', [key]: 3};
        expect(decodeDynamicSpecValue(original)).toEqual({
            changed: 1,
            label: 'Квота 😊',
            binary: '\xff',
            Квота: 3,
        });
        expect(
            encodeDynamicSpecValue(
                {changed: 2, label: 'Квота 😊', binary: '\xff', Квота: 3},
                original,
            ),
        ).toEqual({...original, changed: 2});
    });
    it('treats absent prototype-named keys as missing values', () => {
        expect(dynamicSpecValue({}, ['constructor'])).toBeUndefined();
        expect(dynamicSpecEdits({constructor: 1}, {})).toEqual([
            {path: ['constructor'], value: undefined},
        ]);
    });
    it('keeps lists and typed scalar values atomic while writing only changed leaves', () => {
        expect(
            dynamicSpecEdits(
                {group: {a: 1, b: version}, list: [1, 2]},
                {group: {a: 1, b: newer}, list: [1, 2]},
            ),
        ).toEqual([{path: ['group', 'b'], value: newer}]);
        expect(dynamicSpecEdits({list: [1, 2]}, {list: [1, 3]})).toEqual([
            {path: ['list'], value: [1, 3]},
        ]);
        expect(dynamicSpecEdits({}, {empty: {}})).toEqual([{path: ['empty'], value: {}}]);
        expect(dynamicSpecEdits({group: {a: 1}}, {group: {}})).toEqual([
            {path: ['group', 'a'], value: undefined},
        ]);
    });

    it('escapes a literal path component instead of editing a different nested key', () => {
        expect(dynamicSpecPath(['a/b', 'c@d'])).toBe('/a\\/b/c\\@d');
    });

    it('decodes the actual web-json byte-string token once and preserves decoded Unicode and exact revisions', () => {
        const comment =
            '\u00d0\u0094\u00d0\u00b5\u00d0\u00bc\u00d0\u00be override \u00d0\u00b4\u00d0\u00bb\u00d1\u008f';
        const wire = {
            ...snapshot,
            audit: [{version, timestamp: '2026-10-05T08:48:47.000000Z', comment}],
        };
        const decoded = decodeDynamicSpecAudit(wire);
        expect(decoded.audit[0].comment).toBe('Демо override для');
        expect(decoded.audit[0].version).toBe(version);
        expect(decodeDynamicSpecAudit(decoded)).toEqual(decoded);
        expect(wire.audit[0].comment).toBe(comment);
        expect(
            decodeDynamicSpecAudit({
                ...snapshot,
                audit: [{version, timestamp: '', comment: 'Новая квота 😊'}],
            }).audit[0].comment,
        ).toBe('Новая квота 😊');
    });
});

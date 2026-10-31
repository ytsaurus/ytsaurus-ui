import {genNavigationUrl} from '../../../../utils/navigation/navigation';
import {parseRichStoragePath, resolveStateStoragePath} from './state-storage-path';
import type {FlowStaticSpec} from '../../../../../shared/yt-types';

describe('resolveStateStoragePath', () => {
    const pipelinePath = '//home/pipeline';
    const specWithExternal: FlowStaticSpec = {
        computations: {
            c: {
                external_state_managers: {
                    '/profile': {
                        $attributes: {},
                        $value: {
                            parameters: {
                                path: {$attributes: {cluster: 'seneca'}, $value: '//home/profiles'},
                            },
                        },
                    },
                },
                external_state_joiners: {
                    '/joined': {parameters: {path: '//home/joined'}},
                },
            },
        },
    };
    const baseRow = {computationId: 'c', stateName: '/profile', value: 1};
    it('maps internal key rows to the pipeline states table', () => {
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'key_state', key: [1]},
                pipelinePath,
                undefined,
            ),
        ).toEqual({path: '//home/pipeline/states'});
    });
    it('maps internal partition rows to the partition states table', () => {
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'partition_state', partitionId: 'p'},
                pipelinePath,
                undefined,
            ),
        ).toEqual({path: '//home/pipeline/partition_states'});
    });
    it('resolves an external manager path with its cluster attribute', () => {
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'external_key_state', key: [1]},
                pipelinePath,
                specWithExternal,
            ),
        ).toEqual({path: '//home/profiles', cluster: 'seneca'});
    });
    it('resolves a joiner path', () => {
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'joined_external_key_state', stateName: '/joined', key: [1]},
                pipelinePath,
                specWithExternal,
            ),
        ).toEqual({path: '//home/joined', cluster: undefined});
    });
    it('omits the link when no path resolves', () => {
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'external_key_state', stateName: '/missing', key: [1]},
                pipelinePath,
                specWithExternal,
            ),
        ).toBeUndefined();
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'external_key_state', key: [1]},
                pipelinePath,
                undefined,
            ),
        ).toBeUndefined();
    });
    it('ignores inherited computation and storage-chain values', () => {
        const inheritedComputation = Object.create({
            external_state_managers: {'/profile': {parameters: {path: '//inherited'}}},
        });
        const inheritedSpec = {
            computations: Object.assign(Object.create({inherited: inheritedComputation}), {
                c: {
                    external_state_managers: Object.create({
                        '/profile': {parameters: {path: '//inherited'}},
                    }),
                },
            }),
        } as FlowStaticSpec;
        const inheritedParameterSpec = {
            computations: {
                c: {
                    external_state_managers: {
                        '/profile': Object.create({parameters: {path: '//inherited'}}),
                    },
                },
            },
        } as FlowStaticSpec;
        const inheritedPathSpec = {
            computations: {
                c: {
                    external_state_managers: {
                        '/profile': {parameters: Object.create({path: '//inherited'})},
                    },
                },
            },
        } as FlowStaticSpec;
        for (const [computationId, currentSpec] of [
            ['inherited', inheritedSpec],
            ['c', inheritedSpec],
            ['c', inheritedParameterSpec],
            ['c', inheritedPathSpec],
        ] as const) {
            expect(
                resolveStateStoragePath(
                    {...baseRow, computationId, section: 'external_key_state', key: [1]},
                    pipelinePath,
                    currentSpec,
                ),
            ).toBeUndefined();
        }
    });
    it('ignores an inherited cluster attribute', () => {
        const pathNode = {
            $attributes: Object.create({cluster: 'inherited'}),
            $value: '//home/profiles',
        };
        const currentSpec = {
            computations: {
                c: {external_state_managers: {'/profile': {parameters: {path: pathNode}}}},
            },
        } as FlowStaticSpec;
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'external_key_state', key: [1]},
                pipelinePath,
                currentSpec,
            ),
        ).toEqual({path: '//home/profiles', cluster: undefined});
    });
    it('resolves a fully own special-name storage chain', () => {
        const pathNode = {
            $attributes: Object.fromEntries([['cluster', 'seneca']]),
            $value: '//home/special',
        };
        const declarations = Object.fromEntries([
            ['toString', {parameters: Object.fromEntries([['path', pathNode]])}],
        ]);
        const computations = Object.fromEntries([
            ['__proto__', {external_state_joiners: declarations}],
        ]);
        expect(
            resolveStateStoragePath(
                {
                    computationId: '__proto__',
                    section: 'joined_external_key_state',
                    stateName: 'toString',
                    key: [1],
                    value: 1,
                },
                pipelinePath,
                {computations} as FlowStaticSpec,
            ),
        ).toEqual({path: '//home/special', cluster: 'seneca'});
    });
    function managerSpec(path: unknown): FlowStaticSpec {
        return {
            computations: {c: {external_state_managers: {'/profile': {parameters: {path}}}}},
        } as FlowStaticSpec;
    }
    const externalRow = {...baseRow, section: 'external_key_state', key: [1]} as const;
    it('moves an embedded explicit cluster into the route and keeps a clean cypress path', () => {
        expect(
            resolveStateStoragePath(
                externalRow,
                pipelinePath,
                managerSpec('<cluster=markov>//home/blrt/stable/profiles/Combination'),
            ),
        ).toEqual({path: '//home/blrt/stable/profiles/Combination', cluster: 'markov'});
    });
    it('reads a quoted cluster among other attributes', () => {
        expect(
            resolveStateStoragePath(
                externalRow,
                pipelinePath,
                managerSpec('<cluster="seneca-vla";append=%true>//home/profiles'),
            ),
        ).toEqual({path: '//home/profiles', cluster: 'seneca-vla'});
    });
    it('keeps the current cluster when the attributes carry no cluster', () => {
        expect(
            resolveStateStoragePath(
                externalRow,
                pipelinePath,
                managerSpec('<append=%true>//home/x'),
            ),
        ).toEqual({path: '//home/x', cluster: undefined});
    });
    it('omits the link for malformed rich paths', () => {
        expect(
            resolveStateStoragePath(
                externalRow,
                pipelinePath,
                managerSpec('<cluster=markov//home/x'),
            ),
        ).toBeUndefined();
        expect(
            resolveStateStoragePath(externalRow, pipelinePath, managerSpec('<cluster=markov>')),
        ).toBeUndefined();
    });
    it('prefers the embedded cluster over an annotated one', () => {
        expect(
            resolveStateStoragePath(
                externalRow,
                pipelinePath,
                managerSpec({$attributes: {cluster: 'seneca'}, $value: '<cluster=markov>//home/x'}),
            ),
        ).toEqual({path: '//home/x', cluster: 'markov'});
    });
    it.each([
        ['external_key_state', 'external_state_managers'],
        ['joined_external_key_state', 'external_state_joiners'],
    ] as const)(
        'routes a %s link to a cluster named by a quoted attribute key',
        (section, declarationsField) => {
            for (const path of [
                '<"cluster"="markov";>//home/profiles',
                '<"cluster"=markov>  //home/profiles',
                '<cluster="markov"> //home/profiles',
                '<append=%true; "cluster" = "markov">//home/profiles',
            ]) {
                const spec = {
                    computations: {
                        c: {
                            [declarationsField]: {
                                '/profile': {
                                    parameters: {
                                        path: {$attributes: {cluster: 'seneca'}, $value: path},
                                    },
                                },
                            },
                        },
                    },
                } as FlowStaticSpec;
                const location = resolveStateStoragePath(
                    {...baseRow, section, key: [1]},
                    pipelinePath,
                    spec,
                );
                expect(location).toEqual({path: '//home/profiles', cluster: 'markov'});
                expect(
                    location &&
                        genNavigationUrl({
                            cluster: location.cluster ?? 'hahn',
                            path: location.path,
                        }),
                ).toBe('/markov/navigation?path=//home/profiles');
            }
        },
    );
    it('ignores attribute keys that only resemble cluster', () => {
        expect(parseRichStoragePath('<"cluster "="markov">//home/x')).toEqual({
            path: '//home/x',
            cluster: undefined,
        });
        expect(parseRichStoragePath('<"Cluster"="markov">//home/x')).toEqual({
            path: '//home/x',
            cluster: undefined,
        });
        expect(parseRichStoragePath('<cluster=markov>   ')).toBeUndefined();
    });
    it('parses quoted attribute values containing closing brackets and leaves plain paths alone', () => {
        expect(parseRichStoragePath('<cluster="a>b">//home/x')).toEqual({
            path: '//home/x',
            cluster: 'a>b',
        });
        expect(parseRichStoragePath('//home/x')).toEqual({path: '//home/x', cluster: undefined});
        expect(parseRichStoragePath('<cluster=%true>//home/x')).toEqual({
            path: '//home/x',
            cluster: undefined,
        });
    });
});

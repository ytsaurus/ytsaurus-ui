import {resolveStateStoragePath} from './state-storage-path';
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
});

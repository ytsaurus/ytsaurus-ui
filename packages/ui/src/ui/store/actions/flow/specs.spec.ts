import {type FlowExecuteTypes} from '../../../../shared/yt-types';
import {ytApiV4} from '../../../rum/rum-wrap-api';
import {dynamicSpecActions, staticSpecActions} from '../../../store/reducers/flow/specs';

import {
    type DynamicSpecMutation,
    loadFlowDynamicSpec,
    loadFlowStaticSpec,
    mutateFlowDynamicSpec,
    updateFlowDynamicSpec,
    updateFlowStaticSpec,
} from './specs';

jest.mock('../../../rum/rum-wrap-api', () => ({
    ytApiV4: {
        getPipelineSpec: jest.fn(),
        setPipelineSpec: jest.fn(),
        getPipelineDynamicSpec: jest.fn(),
        setPipelineDynamicSpec: jest.fn(),
        flowExecute: jest.fn(),
    },
}));

jest.mock('../../../pages/flow/Flow/PipelineSpec/i18n', () => ({
    __esModule: true,
    default: (key: string) =>
        jest.requireActual('../../../pages/flow/Flow/PipelineSpec/i18n/en.json')[key],
}));

jest.mock('../../../store/selectors/flow/specs', () => ({
    selectFlowDynamicSpecPath: () => '//home/flow',
    selectFlowStaticSpecPath: () => '//home/flow',
}));

const pipelinePath = '//home/flow';
const version = {$type: 'int64' as const, $value: '1917083822153720177'};
const spec = {job_manager: {resource_limits: {user_slots: 2}}};

describe('Flow specs actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(ytApiV4.getPipelineSpec).mockReset();
        jest.mocked(ytApiV4.flowExecute).mockReset();
        jest.mocked(ytApiV4.getPipelineDynamicSpec).mockReset();
    });
    it.each([
        {
            load: loadFlowStaticSpec,
            get: ytApiV4.getPipelineSpec,
            actions: staticSpecActions,
        },
    ])('loads a spec with a lossless version using web_json', async ({load, get, actions}) => {
        jest.mocked(get).mockResolvedValue({spec, version});
        const dispatch = jest.fn();

        await load(pipelinePath)(dispatch, jest.fn(), undefined);

        expect(get).toHaveBeenCalledWith({
            parameters: {pipeline_path: pipelinePath, output_format: 'web_json'},
            cancellation: expect.any(Function),
        });
        expect(dispatch).toHaveBeenNthCalledWith(
            1,
            actions.onRequest({pipeline_path: pipelinePath}),
        );
        expect(dispatch).toHaveBeenNthCalledWith(2, actions.onSuccess({data: {spec, version}}));
    });

    it('loads matching effective, base, blame and patches without rounding versions', async () => {
        const snapshot = {
            version,
            base_spec: {},
            effective_spec: spec,
            override_spec: {operation: 'set' as const, value: spec, version},
            audit: [{version, timestamp: '2026-10-04T10:00:00.000000Z'}],
        };
        jest.mocked(ytApiV4.flowExecute)
            .mockResolvedValueOnce({
                version,
                patches: [
                    {
                        patch_id: version,
                        timestamp: snapshot.audit[0].timestamp,
                        changes: snapshot.override_spec,
                    },
                ],
            })
            .mockResolvedValueOnce({spec, version, blame: snapshot.override_spec})
            .mockResolvedValueOnce({spec: {}, version});
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(ytApiV4.flowExecute).toHaveBeenNthCalledWith(1, {
            parameters: {
                pipeline_path: pipelinePath,
                flow_command: 'get-pipeline-dynamic-spec-patches',
                output_format: 'web_json',
            },
            data: {},
            cancellation: expect.any(Function),
        });
        expect(ytApiV4.flowExecute).toHaveBeenNthCalledWith(2, {
            parameters: {
                pipeline_path: pipelinePath,
                flow_command: 'get-pipeline-dynamic-spec',
                output_format: 'web_json',
            },
            data: {view: 'effective', blame: true},
            cancellation: expect.any(Function),
        });
        expect(ytApiV4.flowExecute).toHaveBeenNthCalledWith(3, {
            parameters: {
                pipeline_path: pipelinePath,
                flow_command: 'get-pipeline-dynamic-spec',
                output_format: 'web_json',
            },
            data: {view: 'base'},
            cancellation: expect.any(Function),
        });
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({
                data: {spec, version, dynamic_spec_state: snapshot},
            }),
        );
        expect(ytApiV4.getPipelineDynamicSpec).not.toHaveBeenCalled();
    });

    it('loads flat patches and visible blame without requiring changes.children', async () => {
        const source = {
            patch_id: version,
            operation: 'set' as const,
            comment: 'Reason',
            timestamp: '2026-10-05T08:00:00Z',
        };
        const patch = {...source, path: '/group', value: {a: 1}};
        jest.mocked(ytApiV4.flowExecute)
            .mockResolvedValueOnce({version, patches: [patch]})
            .mockResolvedValueOnce({spec, version, blame: {'/group': source}})
            .mockResolvedValueOnce({spec: {}, version});
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({
                data: {
                    spec,
                    version,
                    dynamic_spec_state: {
                        version,
                        effective_spec: spec,
                        base_spec: {},
                        override_spec: {operation: 'inherit'},
                        patches: [patch],
                        blame: {'/group': source},
                        audit: [
                            {
                                version,
                                comment: 'Reason',
                                timestamp: patch.timestamp,
                            },
                        ],
                        runtime_target_state: undefined,
                    },
                },
            }),
        );
    });

    it('retries when sequential reads observe different DynamicSpec versions', async () => {
        const nextVersion = {$type: 'int64' as const, $value: '1917083822153720178'};
        const patches = (revision: typeof version) => ({version: revision, patches: []});
        const effective = (revision: typeof version) => ({
            spec,
            version: revision,
            blame: {operation: 'inherit' as const},
        });
        jest.mocked(ytApiV4.flowExecute)
            .mockResolvedValueOnce(patches(nextVersion))
            .mockResolvedValueOnce(effective(version))
            .mockResolvedValueOnce({spec: {}, version})
            .mockResolvedValueOnce(patches(nextVersion))
            .mockResolvedValueOnce(effective(nextVersion))
            .mockResolvedValueOnce({spec: {}, version: nextVersion});
        const dispatch = jest.fn();

        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);

        expect(ytApiV4.flowExecute).toHaveBeenCalledTimes(6);
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({
                data: {
                    spec,
                    version: nextVersion,
                    dynamic_spec_state: {
                        version: nextVersion,
                        effective_spec: spec,
                        base_spec: {},
                        override_spec: {operation: 'inherit'},
                        runtime_target_state: undefined,
                        audit: [],
                    },
                },
            }),
        );
    });

    it('ignores an obsolete patch list response after reloading the pipeline', async () => {
        let complete!: (
            value: FlowExecuteTypes['get-pipeline-dynamic-spec-patches']['ResponseType'],
        ) => void;
        const pending = new Promise<
            FlowExecuteTypes['get-pipeline-dynamic-spec-patches']['ResponseType']
        >((resolve) => {
            complete = resolve;
        });
        jest.mocked(ytApiV4.flowExecute)
            .mockReturnValueOnce(pending)
            .mockResolvedValueOnce({version, patches: []})
            .mockResolvedValueOnce({spec, version, blame: {operation: 'inherit'}})
            .mockResolvedValueOnce({spec: {}, version});
        const dispatch = jest.fn();

        const obsolete = loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        complete({version, patches: []});
        await obsolete;

        expect(ytApiV4.flowExecute).toHaveBeenCalledTimes(4);
        expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
            dynamicSpecActions.onRequest.type,
            dynamicSpecActions.onRequest.type,
            dynamicSpecActions.onSuccess.type,
        ]);
    });

    it.each([
        {
            message: 'Request failed',
            inner_errors: [
                {
                    message:
                        'No such command: get-pipeline-dynamic-spec-patches. Possible commands: []',
                },
            ],
        },
        {
            message: {
                $type: 'string',
                $value: 'No such command: get-pipeline-dynamic-spec-patches. Possible commands: []',
            },
        },
    ])('falls back only when the patch API is unsupported (%#)', async (error) => {
        jest.mocked(ytApiV4.flowExecute).mockRejectedValue(error);
        jest.mocked(ytApiV4.getPipelineDynamicSpec).mockResolvedValue({spec, version});
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({
                data: {spec, version, dynamic_spec_state_unavailable: true},
            }),
        );
    });

    it.each(['Access denied', 'Network error', 'No such command: describe-pipeline.'])(
        'preserves %s instead of showing empty overrides',
        async (message) => {
            const error = {message};
            jest.mocked(ytApiV4.flowExecute).mockRejectedValue(error);
            const dispatch = jest.fn();
            await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
            expect(dispatch).toHaveBeenLastCalledWith(dynamicSpecActions.onError({error}));
            expect(ytApiV4.getPipelineDynamicSpec).not.toHaveBeenCalled();
        },
    );

    it('rejects a rounded DynamicSpec revision', async () => {
        jest.mocked(ytApiV4.flowExecute).mockResolvedValue({
            version: Number(version.$value),
            spec,
            blame: {operation: 'inherit'},
        });
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(dispatch.mock.calls[1][0].type).toBe(dynamicSpecActions.onError.type);
        expect(dispatch.mock.calls[1][0].payload.error.message).toContain(
            'cannot be represented exactly',
        );
        expect(ytApiV4.getPipelineDynamicSpec).not.toHaveBeenCalled();
    });

    it('sends the lossless version and force when updating a static spec', async () => {
        jest.mocked(ytApiV4.setPipelineSpec).mockResolvedValue(undefined);
        await updateFlowStaticSpec({data: {spec, version}, path: pipelinePath}, {force: true})(
            jest.fn(),
            jest.fn(),
            undefined,
        );
        expect(ytApiV4.setPipelineSpec).toHaveBeenCalledWith(
            {pipeline_path: pipelinePath, expected_version: version, force: true},
            spec,
        );
    });

    it('sends a legacy root update with its reason and lossless CAS through generic flow execute', async () => {
        jest.mocked(ytApiV4.flowExecute).mockResolvedValue({version});
        const comment = 'Причина изменения 😊';
        await updateFlowDynamicSpec({data: {spec, version}, path: pipelinePath, comment})(
            jest.fn((action) => action(jest.fn(), jest.fn(), undefined)),
            jest.fn(),
            undefined,
        );
        expect(ytApiV4.setPipelineDynamicSpec).not.toHaveBeenCalled();
        expect(ytApiV4.flowExecute).toHaveBeenCalledTimes(1);
        expect(ytApiV4.flowExecute).toHaveBeenCalledWith(
            expect.objectContaining({
                parameters: expect.objectContaining({flow_command: 'set-pipeline-dynamic-spec'}),
                data: {
                    path: '',
                    spec,
                    expected_version: version,
                    comment: Buffer.from(comment, 'utf8').toString('latin1'),
                },
            }),
        );
    });
});

describe('sparse DynamicSpec mutations', () => {
    beforeEach(() => jest.clearAllMocks());

    it('writes only the edited leaf and original CAS, including a Unicode comment', async () => {
        jest.mocked(ytApiV4.flowExecute).mockResolvedValue({version});
        const originalSpec = {
            computations: {noop: {empty_batch_backoff: 250, max_rows_per_batch: 1001}},
            target_state: 'completed',
        };
        const edited = {
            computations: {noop: {empty_batch_backoff: 280, max_rows_per_batch: 1001}},
            target_state: 'completed',
        };
        await updateFlowDynamicSpec({
            path: pipelinePath,
            data: {spec: edited, version},
            originalSpec,
            comment: 'Проверка патча',
        })(
            jest.fn((action) => action(jest.fn(), jest.fn(), undefined)),
            jest.fn(),
            undefined,
        );
        expect(ytApiV4.setPipelineDynamicSpec).not.toHaveBeenCalled();
        expect(ytApiV4.flowExecute).toHaveBeenCalledTimes(1);
        expect(ytApiV4.flowExecute).toHaveBeenCalledWith(
            expect.objectContaining({
                parameters: expect.objectContaining({flow_command: 'patch-pipeline-dynamic-spec'}),
                data: {
                    set_path: '/computations/noop/empty_batch_backoff',
                    set_value: 280,
                    expected_version: version,
                    comment: Buffer.from('Проверка патча', 'utf8').toString('latin1'),
                },
            }),
        );
        expect(originalSpec.computations.noop.empty_batch_backoff).toBe(250);
    });

    it('submits no mutation for an unchanged draft', async () => {
        await updateFlowDynamicSpec({
            path: pipelinePath,
            data: {spec, version},
            originalSpec: structuredClone(spec),
        })(jest.fn(), jest.fn(), undefined);
        expect(ytApiV4.flowExecute).not.toHaveBeenCalled();
        expect(ytApiV4.setPipelineDynamicSpec).not.toHaveBeenCalled();
    });

    it.each([{a: 2, b: 3}, {a: 1}, {}])(
        'rejects ambiguous or deleted fields before any write (%j)',
        async (edited) => {
            await expect(
                updateFlowDynamicSpec({
                    path: pipelinePath,
                    data: {spec: edited, version},
                    originalSpec: {a: 1, b: 2},
                })(jest.fn(), jest.fn(), undefined),
            ).rejects.toMatchObject({message: expect.stringContaining('No changes were saved')});
            expect(ytApiV4.flowExecute).not.toHaveBeenCalled();
            expect(ytApiV4.setPipelineDynamicSpec).not.toHaveBeenCalled();
        },
    );

    it.each([
        {
            path: pipelinePath,
            command: 'cancel-pipeline-dynamic-spec-patch' as const,
            body: {patch: version, expected_version: version},
        },
        {
            path: pipelinePath,
            command: 'reset-pipeline-dynamic-spec' as const,
            body: {expected_version: version},
        },
    ] satisfies DynamicSpecMutation[])(
        'sends exact owner/CAS and refreshes after a $command conflict without retrying',
        async (mutation) => {
            const {command, body} = mutation;
            const error = {message: 'Dynamic spec version mismatch'};
            jest.mocked(ytApiV4.flowExecute).mockRejectedValue(error);
            const dispatch = jest.fn();
            await expect(
                mutateFlowDynamicSpec(mutation)(dispatch, jest.fn(), undefined),
            ).rejects.toEqual(error);
            expect(ytApiV4.flowExecute).toHaveBeenCalledTimes(1);
            expect(ytApiV4.flowExecute).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: body,
                    parameters: expect.objectContaining({flow_command: command}),
                }),
            );
            expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
        },
    );
});

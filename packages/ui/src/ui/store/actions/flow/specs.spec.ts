import axios from 'axios';

import {type FlowDynamicSpecSnapshot} from '../../../../shared/yt-types';
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
    selectFlowDynamicSpecPath: jest.fn(() => '//home/flow'),
    selectFlowStaticSpecPath: jest.fn(() => '//home/flow'),
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

    it('loads the atomic snapshot without rounding owner or model versions', async () => {
        const snapshot = {
            version,
            base_spec: {},
            effective_spec: spec,
            override_spec: {operation: 'set' as const, value: spec, version},
            audit: [{version, timestamp: '2026-10-04T10:00:00.000000Z'}],
        };
        jest.mocked(ytApiV4.flowExecute).mockResolvedValue(snapshot);
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(ytApiV4.flowExecute).toHaveBeenCalledWith({
            parameters: {
                pipeline_path: pipelinePath,
                flow_command: 'get-pipeline-dynamic-spec-state',
                output_format: 'web_json',
            },
            data: {},
            cancellation: expect.any(Function),
        });
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({
                data: {spec, version, dynamic_spec_state: snapshot},
            }),
        );
        expect(ytApiV4.getPipelineDynamicSpec).not.toHaveBeenCalled();
    });

    it.each([
        {
            message: 'Request failed',
            inner_errors: [
                {
                    message:
                        'No such command: get-pipeline-dynamic-spec-state. Possible commands: []',
                },
            ],
        },
        {
            message: {
                $type: 'string',
                $value: 'No such command: get-pipeline-dynamic-spec-state. Possible commands: []',
            },
        },
    ])('falls back only when the snapshot command is unsupported (%#)', async (error) => {
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

    describe('current dynamic spec request', () => {
        const snapshot: FlowDynamicSpecSnapshot = {
            version,
            base_spec: {},
            effective_spec: spec,
            override_spec: {operation: 'inherit'},
            audit: [],
        };
        const unsupported = {
            message: 'No such command: get-pipeline-dynamic-spec-state. Possible commands: []',
        };
        const error = {message: 'Access denied'};

        it.each([pipelinePath, '//home/other'])(
            'does not let a settled unsupported request cancel the current load of %s',
            async (currentPath) => {
                const token = axios.CancelToken.source();
                const cancel = jest.spyOn(token, 'cancel');
                let complete = (_value: FlowDynamicSpecSnapshot) => {};
                const pending = new Promise<FlowDynamicSpecSnapshot>((resolve, reject) => {
                    complete = resolve;
                    token.token.promise.then(() => reject({code: 'cancelled'}));
                });
                jest.mocked(ytApiV4.flowExecute)
                    .mockRejectedValueOnce(unsupported)
                    .mockImplementationOnce((...args) => {
                        const request = args[0];
                        if ('cancellation' in request) {
                            request.cancellation?.(token);
                        }
                        return pending;
                    });
                jest.mocked(ytApiV4.getPipelineDynamicSpec).mockImplementationOnce((...args) => {
                    const request = args[0];
                    if ('cancellation' in request) {
                        request.cancellation?.(axios.CancelToken.source());
                    }
                    return Promise.resolve({spec, version});
                });
                const dispatch = jest.fn();
                const old = loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
                const current = loadFlowDynamicSpec(currentPath)(dispatch, jest.fn(), undefined);
                await old;
                complete(snapshot);
                await current;

                expect(ytApiV4.getPipelineDynamicSpec).not.toHaveBeenCalled();
                expect(cancel).not.toHaveBeenCalled();
                expect(dispatch).toHaveBeenLastCalledWith(
                    dynamicSpecActions.onSuccess({
                        data: {spec, version, dynamic_spec_state: snapshot},
                    }),
                );
            },
        );

        it.each([pipelinePath, '//home/other'])(
            'does not let a settled unsupported dynamic request cancel the static load of %s',
            async (currentPath) => {
                const token = axios.CancelToken.source();
                const cancel = jest.spyOn(token, 'cancel');
                let complete = (_value: {spec: typeof spec; version: typeof version}) => {};
                const pending = new Promise<{spec: typeof spec; version: typeof version}>(
                    (resolve, reject) => {
                        complete = resolve;
                        token.token.promise.then(() => reject({code: 'cancelled'}));
                    },
                );
                jest.mocked(ytApiV4.flowExecute).mockRejectedValueOnce(unsupported);
                jest.mocked(ytApiV4.getPipelineSpec).mockImplementationOnce((...args) => {
                    const request = args[0];
                    if ('cancellation' in request) {
                        request.cancellation?.(token);
                    }
                    return pending;
                });
                jest.mocked(ytApiV4.getPipelineDynamicSpec).mockImplementationOnce((...args) => {
                    const request = args[0];
                    if ('cancellation' in request) {
                        request.cancellation?.(axios.CancelToken.source());
                    }
                    return Promise.resolve({spec, version});
                });
                const dispatch = jest.fn();
                const old = loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
                const current = loadFlowStaticSpec(currentPath)(dispatch, jest.fn(), undefined);
                await old;
                complete({spec, version});
                await current;

                expect(ytApiV4.getPipelineDynamicSpec).not.toHaveBeenCalled();
                expect(cancel).not.toHaveBeenCalled();
                expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
                    dynamicSpecActions.onRequest.type,
                    staticSpecActions.onRequest.type,
                    staticSpecActions.onSuccess.type,
                ]);
            },
        );

        it.each(['success', 'error'])(
            'ignores an obsolete static %s after switching to dynamic spec',
            async (result) => {
                let complete = () => {};
                const pending = new Promise<{spec: typeof spec; version: typeof version}>(
                    (resolve, reject) => {
                        complete = () =>
                            result === 'success' ? resolve({spec, version}) : reject(error);
                    },
                );
                jest.mocked(ytApiV4.getPipelineSpec).mockReturnValueOnce(pending);
                jest.mocked(ytApiV4.flowExecute).mockResolvedValueOnce(snapshot);
                const dispatch = jest.fn();
                const old = loadFlowStaticSpec(pipelinePath)(dispatch, jest.fn(), undefined);
                await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
                complete();
                await old;

                expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
                    staticSpecActions.onRequest.type,
                    dynamicSpecActions.onRequest.type,
                    dynamicSpecActions.onSuccess.type,
                ]);
            },
        );

        it.each(['success', 'error'])(
            'ignores an obsolete dynamic %s after switching to static spec',
            async (result) => {
                let complete = () => {};
                const pending = new Promise<FlowDynamicSpecSnapshot>((resolve, reject) => {
                    complete = () => (result === 'success' ? resolve(snapshot) : reject(error));
                });
                jest.mocked(ytApiV4.flowExecute).mockReturnValueOnce(pending);
                jest.mocked(ytApiV4.getPipelineSpec).mockResolvedValueOnce({spec, version});
                const dispatch = jest.fn();
                const old = loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
                await loadFlowStaticSpec(pipelinePath)(dispatch, jest.fn(), undefined);
                complete();
                await old;

                expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
                    dynamicSpecActions.onRequest.type,
                    staticSpecActions.onRequest.type,
                    staticSpecActions.onSuccess.type,
                ]);
            },
        );

        it.each(['success', 'error'])(
            'ignores an obsolete snapshot %s after reloading the same path',
            async (result) => {
                let complete = () => {};
                const pending = new Promise<FlowDynamicSpecSnapshot>((resolve, reject) => {
                    complete = () => (result === 'success' ? resolve(snapshot) : reject(error));
                });
                jest.mocked(ytApiV4.flowExecute)
                    .mockReturnValueOnce(pending)
                    .mockResolvedValueOnce(snapshot);
                const dispatch = jest.fn();
                const old = loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
                await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
                complete();
                await old;

                expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
                    dynamicSpecActions.onRequest.type,
                    dynamicSpecActions.onRequest.type,
                    dynamicSpecActions.onSuccess.type,
                ]);
            },
        );

        it.each(['success', 'error'])('ignores an obsolete legacy fallback %s', async (result) => {
            let complete = () => {};
            const pending = new Promise<{spec: typeof spec; version: typeof version}>(
                (resolve, reject) => {
                    complete = () =>
                        result === 'success' ? resolve({spec, version}) : reject(error);
                },
            );
            jest.mocked(ytApiV4.flowExecute)
                .mockRejectedValueOnce(unsupported)
                .mockResolvedValueOnce(snapshot);
            jest.mocked(ytApiV4.getPipelineDynamicSpec).mockReturnValueOnce(pending);
            const dispatch = jest.fn();
            const old = loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
            await Promise.resolve();
            expect(ytApiV4.getPipelineDynamicSpec).toHaveBeenCalledTimes(1);
            await loadFlowDynamicSpec('//home/other')(dispatch, jest.fn(), undefined);
            complete();
            await old;

            expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
                dynamicSpecActions.onRequest.type,
                dynamicSpecActions.onRequest.type,
                dynamicSpecActions.onSuccess.type,
            ]);
        });
    });

    it('rejects a rounded snapshot revision', async () => {
        jest.mocked(ytApiV4.flowExecute).mockResolvedValue({
            version: Number(version.$value),
            base_spec: {},
            effective_spec: spec,
            override_spec: {operation: 'inherit'},
            audit: [],
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
                parameters: expect.objectContaining({flow_command: 'set-pipeline-dynamic-spec'}),
                data: {
                    path: '/computations/noop/empty_batch_backoff',
                    spec: 280,
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
            body: {version, expected_version: version},
        },
        {
            path: pipelinePath,
            command: 'cancel-pipeline-dynamic-spec-override' as const,
            body: {path: '/computations/noop/max_rows_per_batch', expected_version: version},
        },
        {
            path: pipelinePath,
            command: 'reset-pipeline-dynamic-spec-override' as const,
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

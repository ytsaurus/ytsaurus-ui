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

    it('loads matching effective, base and grouped patches without blame', async () => {
        const patch = {
            patch_id: version,
            timestamp: '2026-10-04T10:00:00Z',
            changes: [{path: '/count', value: 2}],
        };
        jest.mocked(ytApiV4.flowExecute)
            .mockResolvedValueOnce({version, patches: [patch]})
            .mockResolvedValueOnce({spec, version})
            .mockResolvedValueOnce({spec: {}, version});
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({
                data: {
                    version,
                    spec,
                    dynamic_spec_state: {
                        version,
                        base_spec: {},
                        effective_spec: spec,
                        patches: [patch],
                    },
                },
            }),
        );
        expect(ytApiV4.flowExecute).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({data: {view: 'effective'}}),
        );
    });

    it('retries when sequential reads observe different DynamicSpec versions', async () => {
        const nextVersion = {$type: 'int64' as const, $value: '1917083822153720178'};
        const patches = (revision: typeof version) => ({version: revision, patches: []});
        const effective = (revision: typeof version) => ({
            spec,
            version: revision,
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
                        patches: [],
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
            .mockResolvedValueOnce({spec, version})
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
        'preserves %s instead of showing empty patches',
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

    it('preserves the existing root Set API until patch creation is added', async () => {
        jest.mocked(ytApiV4.setPipelineDynamicSpec).mockResolvedValue(undefined);
        await updateFlowDynamicSpec({data: {spec, version}, path: pipelinePath})(
            jest.fn(),
            jest.fn(),
            undefined,
        );
        expect(ytApiV4.setPipelineDynamicSpec).toHaveBeenCalledWith(
            {pipeline_path: pipelinePath, expected_version: version},
            spec,
        );
        expect(ytApiV4.flowExecute).not.toHaveBeenCalled();
    });
});

describe('DynamicSpec patch mutations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(ytApiV4.flowExecute).mockReset();
    });

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

describe('patch value and comment updates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(ytApiV4.flowExecute).mockResolvedValue({version});
    });
    it.each([undefined, [{path: '/computations/noop/batch_duration', value: 1002}]])(
        'sends only explicitly changed patch data (%j)',
        async (changes) => {
            const comment = 'Исправление YTFRONT-6091';
            const body = {
                patch: version,
                expected_version: version,
                comment,
                ...(changes ? {set_changes: changes} : {}),
            };
            await mutateFlowDynamicSpec({
                path: pipelinePath,
                command: 'patch-pipeline-dynamic-spec',
                body,
            })(jest.fn(), jest.fn(), undefined);
            expect(ytApiV4.flowExecute).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {...body, comment: Buffer.from(comment).toString('latin1')},
                }),
            );
        },
    );
});

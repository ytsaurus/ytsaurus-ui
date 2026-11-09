import {ytApiV4} from '../../../rum/rum-wrap-api';
import {
    dynamicSpec,
    dynamicSpecActions,
    staticSpecActions,
} from '../../../store/reducers/flow/specs';

import {
    loadFlowDynamicSpec,
    loadFlowDynamicSpecForEdit,
    loadFlowStaticSpec,
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

jest.mock('../../../store/selectors/flow/specs', () => ({
    selectFlowDynamicSpecPath: () => '//home/flow',
    selectFlowDynamicSpecSupportedFeatures: (state: {features: string[]}) => state.features,
    selectFlowStaticSpecPath: () => '//home/flow',
}));

const pipelinePath = '//home/flow';
const version = {$type: 'int64' as const, $value: '1917083822153720177'};
const spec = {job_manager: {resource_limits: {user_slots: 2}}};

describe('Flow specs actions', () => {
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

    it.each([
        {
            update: updateFlowStaticSpec,
            set: ytApiV4.setPipelineSpec,
            options: {force: true},
        },
        {
            update: updateFlowDynamicSpec,
            set: ytApiV4.setPipelineDynamicSpec,
            options: undefined,
        },
    ])('sends the lossless version back when updating a spec', async ({update, set, options}) => {
        jest.mocked(set).mockResolvedValue(undefined);
        const dispatch = jest.fn();
        const data = {spec, version};

        const action =
            options === undefined
                ? update({data, path: pipelinePath})
                : update({data, path: pipelinePath}, options);
        await action(dispatch, jest.fn(), undefined);

        expect(set).toHaveBeenCalledWith(
            {
                pipeline_path: pipelinePath,
                expected_version: version,
                ...(options ?? {}),
            },
            spec,
        );
    });
});

const features = ['dynamic_spec_patches'];
const flowExecute = jest.mocked(ytApiV4.flowExecute);
const phases = ['get-supported-features', 'get-pipeline-dynamic-spec'] as const;
const responses = [features, {spec, version}];

describe('dynamic spec feature discovery', () => {
    beforeEach(() => {
        flowExecute.mockReset();
        jest.mocked(ytApiV4.getPipelineDynamicSpec).mockReset();
    });

    it.each(['effective', 'base'] as const)(
        'loads only %s after controller discovery',
        async (view) => {
            flowExecute.mockResolvedValueOnce(features).mockResolvedValueOnce({spec, version});
            const dispatch = jest.fn();
            await loadFlowDynamicSpec(pipelinePath, view)(dispatch, jest.fn(), undefined);
            expect(flowExecute.mock.calls.map(([request]) => request)).toEqual([
                {
                    parameters: {
                        pipeline_path: pipelinePath,
                        flow_command: 'get-supported-features',
                        output_format: 'web_json',
                    },
                    data: {},
                    cancellation: expect.any(Function),
                },
                {
                    parameters: {
                        pipeline_path: pipelinePath,
                        flow_command: 'get-pipeline-dynamic-spec',
                        output_format: 'web_json',
                    },
                    data: {view},
                    cancellation: expect.any(Function),
                },
            ]);
            expect(dispatch).toHaveBeenLastCalledWith(
                dynamicSpecActions.onSuccess({data: {spec, version}, supported_features: features}),
            );
            expect(ytApiV4.getPipelineDynamicSpec).not.toHaveBeenCalled();
        },
    );

    it.each([
        [Buffer.from('Причина').toString('latin1'), 'Причина'],
        ['Причина 😊', 'Причина 😊'],
        ['\xff', '\xff'],
    ])('reads patches with exact IDs and decoded comments (%#)', async (raw, decoded) => {
        const patches = ['9223372036854775806', '9223372036854775807'].map((id) => ({
            patch_id: {$type: 'int64' as const, $value: id},
            timestamp: '2026-11-02T15:55:23Z',
            comment: raw,
            changes: [{path: '/count', value: {$type: 'uint64', $value: '18446744073709551615'}}],
        }));
        flowExecute.mockResolvedValueOnce(features).mockResolvedValueOnce({version, patches});
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath, 'patches')(dispatch, jest.fn(), undefined);
        expect(flowExecute).toHaveBeenCalledTimes(2);
        expect(flowExecute).toHaveBeenLastCalledWith({
            parameters: {
                pipeline_path: pipelinePath,
                flow_command: 'get-pipeline-dynamic-spec-patches',
                output_format: 'web_json',
            },
            data: {},
            cancellation: expect.any(Function),
        });
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({
                supported_features: features,
                data: {
                    version,
                    spec: undefined,
                    patches: patches.map((patch) => ({...patch, comment: decoded})),
                },
            }),
        );
    });

    it.each([
        {message: 'No such command: get-supported-features, possible commands: []'},
        {
            message:
                'No such command: get-supported-features. Cannot get required permission for unknown command.',
        },
        {
            message: 'Request failed',
            inner_errors: [
                {
                    message: {
                        $type: 'string',
                        $value: 'No such command: get-supported-features. Possible commands: []',
                    },
                },
            ],
        },
    ])('uses legacy reading for an old Controller (%#)', async (error) => {
        flowExecute.mockRejectedValueOnce(error);
        jest.mocked(ytApiV4.getPipelineDynamicSpec).mockResolvedValue({spec, version});
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(flowExecute).toHaveBeenCalledTimes(1);
        expect(ytApiV4.getPipelineDynamicSpec).toHaveBeenCalledWith({
            parameters: {pipeline_path: pipelinePath, output_format: 'web_json'},
            cancellation: expect.any(Function),
        });
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({data: {spec, version}, supported_features: []}),
        );
    });

    it('uses legacy reading when the controller does not advertise patches', async () => {
        flowExecute.mockResolvedValueOnce(['another_feature']);
        jest.mocked(ytApiV4.getPipelineDynamicSpec).mockResolvedValue({spec, version});
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(flowExecute).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({
                data: {spec, version},
                supported_features: ['another_feature'],
            }),
        );
    });

    it.each(
        phases.flatMap((phase, index) =>
            [
                'Access denied',
                'Network error',
                'No such command: describe-pipeline.',
                'No such command: get-pipeline-dynamic-spec.',
            ].map((message) => ({phase, index, message})),
        ),
    )('preserves $message at $phase', async ({index, message}) => {
        responses
            .slice(0, index)
            .forEach((response) => flowExecute.mockResolvedValueOnce(response));
        const error = {message};
        flowExecute.mockRejectedValueOnce(error);
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(dispatch).toHaveBeenLastCalledWith(dynamicSpecActions.onError({error}));
        expect(ytApiV4.getPipelineDynamicSpec).not.toHaveBeenCalled();
    });

    it('rediscovers features after the controller changes', async () => {
        flowExecute
            .mockResolvedValueOnce(features)
            .mockResolvedValueOnce({spec, version})
            .mockRejectedValueOnce({message: 'No such command: get-supported-features.'});
        jest.mocked(ytApiV4.getPipelineDynamicSpec).mockResolvedValue({spec, version});
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(flowExecute).toHaveBeenCalledTimes(3);
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({data: {spec, version}, supported_features: []}),
        );
    });

    it.each(
        phases.flatMap((phase, index) =>
            ['static', 'dynamic'].map((target) => ({phase, index, target})),
        ),
    )('ignores obsolete $phase after switching to $target spec', async ({index, target}) => {
        let complete!: (response: (typeof responses)[number]) => void;
        let reached!: () => void;
        const pending = new Promise<(typeof responses)[number]>((resolve) => {
            complete = resolve;
        });
        const started = new Promise<void>((resolve) => {
            reached = resolve;
        });
        responses
            .slice(0, index)
            .forEach((response) => flowExecute.mockResolvedValueOnce(response));
        flowExecute.mockImplementationOnce(() => {
            reached();
            return pending;
        });
        const dispatch = jest.fn();
        const obsolete = loadFlowDynamicSpec('//old', 'base')(dispatch, jest.fn(), undefined);
        await started;
        if (target === 'dynamic') {
            flowExecute.mockResolvedValueOnce(features).mockResolvedValueOnce({spec, version});
            await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        } else {
            jest.mocked(ytApiV4.getPipelineSpec).mockResolvedValue({spec, version});
            await loadFlowStaticSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        }
        complete(responses[index]);
        await obsolete;
        expect(flowExecute).toHaveBeenCalledTimes(index + 1 + (target === 'dynamic' ? 2 : 0));
        const success = dispatch.mock.calls.filter(
            ([action]) => action.type === dynamicSpecActions.onSuccess.type,
        );
        expect(success).toHaveLength(target === 'dynamic' ? 1 : 0);
    });

    it('clears view data and pipeline capabilities at their respective boundaries', () => {
        const loading = dynamicSpec(
            undefined,
            dynamicSpecActions.onRequest({pipeline_path: pipelinePath, view: 'effective'}),
        );
        const loaded = dynamicSpec(
            loading,
            dynamicSpecActions.onSuccess({data: {spec, version}, supported_features: features}),
        );
        const otherView = dynamicSpec(
            loaded,
            dynamicSpecActions.onRequest({pipeline_path: pipelinePath, view: 'patches'}),
        );
        expect(otherView.data).toBeUndefined();
        expect(otherView.supported_features).toEqual(features);
        const otherPipeline = dynamicSpec(
            loaded,
            dynamicSpecActions.onRequest({pipeline_path: '//other', view: 'effective'}),
        );
        expect(otherPipeline).toMatchObject({
            loaded: false,
            loading: true,
            pipeline_path: '//other',
        });
        expect(otherPipeline.data).toBeUndefined();
        expect(otherPipeline.supported_features).toBeUndefined();
    });
});

describe('dynamic specification base editing', () => {
    it('reads base and its version without replacing the selected view', async () => {
        jest.mocked(ytApiV4.flowExecute).mockResolvedValue({spec, version});
        const dispatch = jest.fn();
        const draft = await loadFlowDynamicSpecForEdit(pipelinePath)(
            dispatch,
            (() => ({features: ['dynamic_spec_patches']})) as never,
            undefined,
        );
        expect(draft).toEqual({spec, version});
        expect(ytApiV4.flowExecute).toHaveBeenCalledWith({
            parameters: {
                pipeline_path: pipelinePath,
                output_format: 'web_json',
                flow_command: 'get-pipeline-dynamic-spec',
            },
            data: {view: 'base'},
        });
        expect(dispatch).not.toHaveBeenCalled();
    });
    it('keeps the legacy read when patches are unsupported', async () => {
        jest.mocked(ytApiV4.getPipelineDynamicSpec).mockResolvedValue({spec, version});
        const draft = await loadFlowDynamicSpecForEdit(pipelinePath)(
            jest.fn(),
            (() => ({features: []})) as never,
            undefined,
        );
        expect(draft).toEqual({spec, version});
    });
});

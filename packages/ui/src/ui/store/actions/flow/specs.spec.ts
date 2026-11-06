import {ytApiV4} from '../../../rum/rum-wrap-api';
import {dynamicSpecActions, staticSpecActions} from '../../../store/reducers/flow/specs';

import {
    loadFlowDynamicSpec,
    loadFlowStaticSpec,
    mutateFlowDynamicSpec,
    updateFlowDynamicSpec,
    updateFlowStaticSpec,
} from './specs';

jest.mock('../../../rum/rum-wrap-api', () => ({
    ytApiV4: {
        flowExecute: jest.fn(),
        getPipelineSpec: jest.fn(),
        setPipelineSpec: jest.fn(),
        getPipelineDynamicSpec: jest.fn(),
        setPipelineDynamicSpec: jest.fn(),
    },
}));

jest.mock('../../../pages/flow/Flow/PipelineSpec/i18n', () => ({
    __esModule: true,
    default: (key: string) => key,
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
        jest.resetAllMocks();
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

describe('DynamicSpec patches API', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it('gets the current effective spec and version after probing support', async () => {
        jest.mocked(ytApiV4.flowExecute)
            .mockResolvedValueOnce({version, patches: []})
            .mockResolvedValueOnce({spec, version});
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(ytApiV4.flowExecute).toHaveBeenLastCalledWith(
            expect.objectContaining({
                parameters: expect.objectContaining({flow_command: 'get-pipeline-dynamic-spec'}),
                data: {view: 'effective'},
            }),
        );
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({data: {spec, version}}),
        );
    });
    it('falls back only when the controller has no patches command', async () => {
        jest.mocked(ytApiV4.flowExecute).mockRejectedValue({
            message: 'No such command: get-pipeline-dynamic-spec-patches.',
        });
        jest.mocked(ytApiV4.getPipelineDynamicSpec).mockResolvedValue({spec, version});
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(dispatch).toHaveBeenLastCalledWith(
            dynamicSpecActions.onSuccess({
                data: {spec, version, dynamic_spec_state_unavailable: true},
            }),
        );
    });
    it('does not treat permission errors as an unsupported controller', async () => {
        const error = {message: 'Permission denied'};
        jest.mocked(ytApiV4.flowExecute).mockRejectedValue(error);
        const dispatch = jest.fn();
        await loadFlowDynamicSpec(pipelinePath)(dispatch, jest.fn(), undefined);
        expect(ytApiV4.getPipelineDynamicSpec).not.toHaveBeenCalled();
        expect(dispatch).toHaveBeenLastCalledWith(dynamicSpecActions.onError({error}));
    });
    it('submits multiple set changes in one request without a patch ID', async () => {
        const set_changes = [
            {path: '/a/b', value: 2},
            {path: '/c', value: 3},
        ];
        jest.mocked(ytApiV4.flowExecute).mockResolvedValue({version, patch_id: version});
        await mutateFlowDynamicSpec({
            path: pipelinePath,
            command: 'patch-pipeline-dynamic-spec',
            body: {set_changes, comment: 'Tune', expected_version: version},
        })(jest.fn(), jest.fn(), undefined);
        expect(ytApiV4.flowExecute).toHaveBeenCalledTimes(1);
        expect(ytApiV4.flowExecute).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {set_changes, comment: 'Tune', expected_version: version},
            }),
        );
    });
    it('propagates optimistic conflicts and schedules a refresh', async () => {
        const error = {message: 'DynamicSpec version mismatch'};
        jest.mocked(ytApiV4.flowExecute).mockRejectedValue(error);
        const dispatch = jest.fn();
        await expect(
            mutateFlowDynamicSpec({
                path: pipelinePath,
                command: 'patch-pipeline-dynamic-spec',
                body: {
                    set_changes: [{path: '/a', value: 2}],
                    comment: 'Tune',
                    expected_version: version,
                },
            })(dispatch, jest.fn(), undefined),
        ).rejects.toEqual(error);
        expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    });
});

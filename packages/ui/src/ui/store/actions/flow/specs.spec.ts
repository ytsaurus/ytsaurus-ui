import {ytApiV4} from '../../../rum/rum-wrap-api';
import {dynamicSpecActions, staticSpecActions} from '../../../store/reducers/flow/specs';

import {
    loadFlowDynamicSpec,
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
    },
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
    });

    it.each([
        {
            load: loadFlowStaticSpec,
            get: ytApiV4.getPipelineSpec,
            actions: staticSpecActions,
        },
        {
            load: loadFlowDynamicSpec,
            get: ytApiV4.getPipelineDynamicSpec,
            actions: dynamicSpecActions,
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

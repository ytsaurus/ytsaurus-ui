import axios from 'axios';

import {chytApiAction} from '../../../utils/strawberryControllerApi';
import {loadCreationOptions} from './creation-options-api';

jest.mock('../../../utils/strawberryControllerApi', () => ({chytApiAction: jest.fn()}));
const api = jest.mocked(chytApiAction);

beforeEach(() => jest.resetAllMocks());

it('requests controller defaults without alias and preserves configured values', async () => {
    const cancelToken = axios.CancelToken.source().token;
    api.mockResolvedValue({
        result: [
            {
                title: 'Resources',
                hidden: false,
                options: [
                    {
                        name: 'instance_count',
                        type: 'int64',
                        default_value: 3,
                        min_value: 1,
                        max_value: 20,
                    },
                    {name: 'instance_cpu', type: 'int64', default_value: 12},
                    {
                        name: 'instance_total_memory',
                        type: 'byte_count',
                        default_value: 48 * 1024 ** 3,
                    },
                ],
            },
        ],
    });
    const options = await loadCreationOptions('test-cluster', true, cancelToken);
    expect(api).toHaveBeenCalledWith(
        'describe_creation_options',
        'test-cluster',
        {},
        {
            isAdmin: true,
            cancelToken,
            skipErrorToast: true,
        },
    );
    expect(options).toMatchObject({
        legacy: false,
        resources: {
            instanceCount: {default_value: 3},
            instanceCpu: {default_value: 12},
            instanceMemory: {default_value: 48 * 1024 ** 3},
        },
    });
});

it('returns the original form mode silently for an older controller', async () => {
    api.mockRejectedValue({response: {status: 404}});
    await expect(
        loadCreationOptions('old-cluster', false, axios.CancelToken.source().token),
    ).resolves.toEqual({legacy: true});
});

it.each([401, 403, 500, 504])(
    'propagates errors instead of using legacy mode (%s)',
    async (status) => {
        const error = {response: {status}};
        api.mockRejectedValue(error);
        await expect(
            loadCreationOptions('test-cluster', false, axios.CancelToken.source().token),
        ).rejects.toBe(error);
    },
);

it('propagates request cancellation', async () => {
    const source = axios.CancelToken.source();
    source.cancel();
    api.mockRejectedValue(source.token.reason);
    await expect(loadCreationOptions('test-cluster', false, source.token)).rejects.toBe(
        source.token.reason,
    );
});

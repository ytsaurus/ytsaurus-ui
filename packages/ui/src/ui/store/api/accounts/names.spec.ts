import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {fetchAccountNames} from './names';

jest.mock('../../../rum/rum-wrap-api', () => ({
    YTApiId: {listAccounts: 'listAccounts'},
    ytApiV3Id: {list: jest.fn()},
}));

const listMock = jest.mocked(ytApiV3Id.list);

describe('fetchAccountNames', () => {
    beforeEach(() => {
        listMock.mockReset();
    });

    it('loads the cached account list with the maximum supported size', async () => {
        listMock.mockResolvedValue(['one', 'two']);

        await expect(fetchAccountNames({cluster: 'cluster'})).resolves.toEqual({
            data: ['one', 'two'],
        });
        expect(listMock).toHaveBeenCalledWith(YTApiId.listAccounts, {
            setup: undefined,
            parameters: {
                path: '//sys/accounts',
                max_size: 1000000,
                read_from: 'cache',
                disable_per_user_cache: true,
            },
        });
    });

    it('returns a request error', async () => {
        const error = new Error('request failed');
        listMock.mockRejectedValue(error);

        await expect(fetchAccountNames({cluster: 'cluster'})).resolves.toEqual({error});
    });
});

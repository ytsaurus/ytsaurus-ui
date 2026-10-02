import {YTApiId} from '../../../rum/rum-wrap-api';
import {get} from '../yt/get/endpoint';
import {ACCOUNT_EDITOR_ATTRIBUTES, fetchAccountEditorPath, fetchAccountEditorTree} from './editor';

jest.mock('../yt/get/endpoint', () => ({get: jest.fn()}));

const getMock = jest.mocked(get);

describe('account editor endpoints', () => {
    beforeEach(() => {
        getMock.mockReset();
    });

    it('loads the account path', async () => {
        getMock.mockResolvedValue({data: '//sys/account_tree/top/account'});

        await expect(
            fetchAccountEditorPath({cluster: 'cluster', accountName: 'account'}),
        ).resolves.toEqual({data: '//sys/account_tree/top/account'});
        expect(getMock).toHaveBeenCalledWith({
            cluster: 'cluster',
            id: YTApiId.accountsEditData,
            parameters: {path: '//sys/accounts/account/@path'},
        });
    });

    it('loads only the requested top-level tree with editor attributes', async () => {
        getMock.mockResolvedValue({data: {$value: {}}});

        await fetchAccountEditorTree({cluster: 'cluster', topLevel: 'top'});

        expect(getMock).toHaveBeenCalledWith({
            cluster: 'cluster',
            id: YTApiId.accountsEditData,
            parameters: {
                path: '//sys/account_tree/top',
                attributes: ACCOUNT_EDITOR_ATTRIBUTES,
            },
        });
    });

    it('returns a request error unchanged', async () => {
        const error = new Error('request failed');
        getMock.mockResolvedValue({error});

        await expect(
            fetchAccountEditorPath({cluster: 'cluster', accountName: 'account'}),
        ).resolves.toEqual({error});
    });
});

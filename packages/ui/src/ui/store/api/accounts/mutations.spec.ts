import {setAccountAbc, setAccountParent} from '../../../utils/accounts/editor';
import {setAccountQuotaImpl} from '../../../utils/accounts/account-quota';
import {updateAccountAbc, updateAccountParent, updateAccountQuota} from './mutations';

jest.mock('../../../utils/accounts/editor', () => ({
    setAccountAbc: jest.fn(),
    setAccountParent: jest.fn(),
}));
jest.mock('../../../utils/accounts/account-quota', () => ({setAccountQuotaImpl: jest.fn()}));
jest.mock('../../../utils/utils', () => ({
    wrapApiPromiseByToaster: (promise: Promise<unknown>) => promise,
}));
jest.mock('../../actions/accounts/i18n', () => () => 'Quota updated');

const setAccountAbcMock = jest.mocked(setAccountAbc);
const setAccountParentMock = jest.mocked(setAccountParent);
const setAccountQuotaMock = jest.mocked(setAccountQuotaImpl);

describe('account general mutations', () => {
    beforeEach(() => {
        setAccountAbcMock.mockReset();
        setAccountParentMock.mockReset();
        setAccountQuotaMock.mockReset();
    });

    it('updates ABC through the existing account editor API', async () => {
        setAccountAbcMock.mockResolvedValue(undefined);

        await expect(
            updateAccountAbc({
                cluster: 'cluster',
                accountName: 'account',
                abc: {id: 42, slug: 'service'},
            }),
        ).resolves.toEqual({data: 'account'});
        expect(setAccountAbcMock).toHaveBeenCalledWith('account', 42, 'service');
    });

    it('updates Parent through the existing account editor API', async () => {
        setAccountParentMock.mockResolvedValue(undefined);

        await expect(
            updateAccountParent({
                cluster: 'cluster',
                accountName: 'account',
                parentName: 'parent',
            }),
        ).resolves.toEqual({data: 'account'});
        expect(setAccountParentMock).toHaveBeenCalledWith('account', 'parent');
    });

    it('returns mutation errors', async () => {
        const error = new Error('request failed');
        setAccountParentMock.mockRejectedValue(error);

        await expect(
            updateAccountParent({
                cluster: 'cluster',
                accountName: 'account',
                parentName: 'parent',
            }),
        ).resolves.toEqual({error});
    });

    it('updates quota through the shared implementation', async () => {
        setAccountQuotaMock.mockResolvedValue(undefined);
        const params = {
            cluster: 'cluster',
            account: 'account',
            limit: 10,
            limitDiff: 2,
            resourcePath: 'node_count',
        };

        await expect(updateAccountQuota(params)).resolves.toEqual({data: 'account'});
        expect(setAccountQuotaMock).toHaveBeenCalledWith({
            account: 'account',
            limit: 10,
            limitDiff: 2,
            resourcePath: 'node_count',
        });
    });
});
